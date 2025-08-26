"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CameraCapture from "./CameraCapture";
import { useToast } from "@/hooks/use-toast";
import { extractInfoFromId, extractLicensePlate } from "@/app/actions";

const formSchema = z.object({
  licensePlate: z.string().min(1, "License plate is required."),
  driverName: z.string().min(2, "Name must be at least 2 characters."),
  visitorType: z.string({ required_error: "Please select a visitor type." }),
  destination: z.string({ required_error: "Please select a destination." }),
  vehicleType: z.string({ required_error: "Please select a vehicle type." }),
  vehicleBrand: z.string({ required_error: "Please select a vehicle brand." }),
  vehicleColor: z.string({ required_error: "Please select a vehicle color." }),
  idPhoto: z.string().optional(),
  vehiclePhoto: z.string().optional(),
  documentNumber: z.string().optional(),
});

interface VehicleRegistrationFormProps {
  onClose: () => void;
}

export default function VehicleRegistrationForm({ onClose }: VehicleRegistrationFormProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'id' | 'vehicle' | null>(null);
  const [isProcessingId, setIsProcessingId] = useState(false);
  const [isProcessingPlate, setIsProcessingPlate] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licensePlate: "",
      driverName: "",
    },
  });

  const idPhotoValue = form.watch('idPhoto');
  const vehiclePhotoValue = form.watch('vehiclePhoto');

  const openCamera = (target: 'id' | 'vehicle') => {
    setCameraTarget(target);
    setIsCameraOpen(true);
  };
  
  const handleCapture = (imageDataUri: string) => {
    if (cameraTarget === 'id') {
      form.setValue('idPhoto', imageDataUri);
    } else if (cameraTarget === 'vehicle') {
      form.setValue('vehiclePhoto', imageDataUri);
    }
    setIsCameraOpen(false);
    setCameraTarget(null);
  };

  const handleExtractId = async () => {
    if (!idPhotoValue) {
      toast({ variant: "destructive", title: "No ID Photo", description: "Please capture a photo of the ID first." });
      return;
    }
    setIsProcessingId(true);
    const result = await extractInfoFromId(idPhotoValue);
    if ('error' in result) {
        toast({ variant: "destructive", title: "AI Extraction Failed", description: result.error });
    } else {
        form.setValue("driverName", result.visitorName, { shouldValidate: true });
        form.setValue("documentNumber", result.visitorDocumentNumber, { shouldValidate: true });
        toast({ title: "Information Extracted", description: `Visitor details updated. Confidence: ${Math.round(result.confidence * 100)}%` });
    }
    setIsProcessingId(false);
  };

  const handleExtractPlate = async () => {
    if (!vehiclePhotoValue) {
      toast({ variant: "destructive", title: "No Vehicle Photo", description: "Please capture a photo of the vehicle first." });
      return;
    }
    setIsProcessingPlate(true);
    const result = await extractLicensePlate(vehiclePhotoValue);
    if ('error' in result) {
        toast({ variant: "destructive", title: "AI Extraction Failed", description: result.error });
    } else {
        form.setValue("licensePlate", result.licensePlate, { shouldValidate: true });
        toast({ title: "License Plate Extracted", description: `Plate updated. Confidence: ${Math.round(result.confidence * 100)}%` });
    }
    setIsProcessingPlate(false);
  };


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    toast({
      title: "Vehicle Registered",
      description: `Vehicle with plate ${values.licensePlate} has been checked in.`,
    });
    onClose();
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
             <FormField
                control={form.control}
                name="idPhoto"
                render={({ field }) => (
                <FormItem className="flex flex-col items-center gap-2">
                    <FormLabel>ID Photo</FormLabel>
                    <div className="relative h-32 w-48 rounded-md border-2 border-dashed bg-muted">
                        {field.value && <Image src={field.value} alt="ID Photo" layout="fill" objectFit="contain" className="rounded-md" />}
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => openCamera('id')}>
                        {field.value ? "Retake" : "Capture ID"}
                      </Button>
                      <Button type="button" size="sm" onClick={handleExtractId} disabled={!field.value || isProcessingId}>
                          {isProcessingId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Extract with AI
                      </Button>
                    </div>
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="vehiclePhoto"
                render={({ field }) => (
                <FormItem className="flex flex-col items-center gap-2">
                    <FormLabel>Vehicle Photo</FormLabel>
                    <div className="relative h-32 w-48 rounded-md border-2 border-dashed bg-muted">
                        {field.value && <Image src={field.value} alt="Vehicle Photo" layout="fill" objectFit="contain" className="rounded-md" />}
                    </div>
                     <div className="flex flex-wrap justify-center gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => openCamera('vehicle')}>
                            {field.value ? "Retake" : "Capture Vehicle"}
                        </Button>
                         <Button type="button" size="sm" onClick={handleExtractPlate} disabled={!field.value || isProcessingPlate}>
                            {isProcessingPlate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Extract Plate
                        </Button>
                    </div>
                </FormItem>
                )}
            />
          </div>

          <FormField
            control={form.control}
            name="driverName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver's Full Name</FormLabel>
                <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
             <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>License Plate</FormLabel>
                    <FormControl><Input placeholder="ABC-123" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="visitorType"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Visitor Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="visit">Visit</SelectItem>
                            <SelectItem value="provider">Provider</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select address" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="a101">A-101</SelectItem>
                            <SelectItem value="b203">B-203</SelectItem>
                            <SelectItem value="c305">C-305</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
             <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="sedan">Sedan</SelectItem>
                            <SelectItem value="suv">SUV</SelectItem>
                            <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="vehicleBrand"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="nissan">Nissan</SelectItem>
                            <SelectItem value="ford">Ford</SelectItem>
                            <SelectItem value="toyota">Toyota</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="vehicleColor"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="white">White</SelectItem>
                            <SelectItem value="gray">Gray</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">Register Vehicle</Button>
          </div>
        </form>
      </Form>
      
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Capture {cameraTarget === 'id' ? 'ID Photo' : 'Vehicle Photo'}</DialogTitle>
          </DialogHeader>
          <CameraCapture onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
