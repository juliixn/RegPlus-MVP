"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CameraCapture from "./CameraCapture";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { extractInfoFromId, addPedestrianEntry } from "@/app/actions";

const formSchema = z.object({
  visitorName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  visitorType: z.string({ required_error: "Please select a visitor type." }),
  destination: z.string({ required_error: "Please select a destination." }),
  idPhoto: z.string().optional(),
});

interface PedestrianRegistrationFormProps {
  onClose: () => void;
}

export default function PedestrianRegistrationForm({ onClose }: PedestrianRegistrationFormProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitorName: "",
    },
  });

  const idPhotoValue = form.watch('idPhoto');

  const handleCaptureId = (imageDataUri: string) => {
    form.setValue("idPhoto", imageDataUri);
    setIsCameraOpen(false);
  };

  const handleExtract = async () => {
    if (!idPhotoValue) {
      toast({ variant: "destructive", title: "No ID Photo", description: "Please capture a photo of the ID first." });
      return;
    }
    setIsProcessing(true);
    const result = await extractInfoFromId(idPhotoValue);
    if ('error' in result) {
        toast({ variant: "destructive", title: "AI Extraction Failed", description: result.error });
    } else {
        form.setValue("visitorName", result.visitorName, { shouldValidate: true });
        toast({ title: "Information Extracted", description: `Visitor name updated. Confidence: ${Math.round(result.confidence * 100)}%` });
    }
    setIsProcessing(false);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const result = await addPedestrianEntry({
        visitorName: values.visitorName,
        visitorType: values.visitorType,
        destination: values.destination,
    });

    if (result.success) {
        toast({
            title: "Pedestrian Registered",
            description: `Visitor ${values.visitorName} has been checked in.`,
        });
        onClose();
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "Could not save the registration.",
        });
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="idPhoto"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center gap-2">
                <Label>ID Photo</Label>
                <div className="relative h-32 w-48 rounded-md border-2 border-dashed bg-muted">
                    {field.value && <Image src={field.value} alt="ID Photo" layout="fill" objectFit="contain" className="rounded-md" />}
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCameraOpen(true)} disabled={isSubmitting}>
                      {field.value ? "Retake Photo" : "Take Photo"}
                    </Button>
                    <Button type="button" onClick={handleExtract} disabled={!field.value || isProcessing || isSubmitting}>
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Extract with AI
                    </Button>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visitorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} disabled={isSubmitting}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="visitorType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visitor Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
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
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select address" />
                      </SelectTrigger>
                    </FormControl>
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

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register Pedestrian
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Capture ID Photo</DialogTitle>
          </DialogHeader>
          <CameraCapture onCapture={handleCaptureId} onClose={() => setIsCameraOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
