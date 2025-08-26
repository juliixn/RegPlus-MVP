"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CameraCapture from "./CameraCapture";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { addPackageEntry, addFileAndGetURL } from "@/app/actions";

const formSchema = z.object({
  recipient: z.string({ required_error: "Please select the recipient." }),
  courier: z.string({ required_error: "Please select the courier." }),
  trackingNumber: z.string().optional(),
  packagePhotoUrl: z.string().optional(),
  packagePhotoData: z.string().optional(),
});

interface PackageRegistrationFormProps {
  onClose: () => void;
}

export default function PackageRegistrationForm({ onClose }: PackageRegistrationFormProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trackingNumber: "",
    },
  });

  const packagePhotoData = form.watch('packagePhotoData');

  const handleCapture = (imageDataUri: string) => {
    form.setValue("packagePhotoData", imageDataUri);
    setIsCameraOpen(false);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    let photoUrl = '';

    // Step 1: Upload photo to Firebase Storage if it exists
    if (values.packagePhotoData) {
        const filePath = `package_photos/${Date.now()}.jpg`;
        const uploadResult = await addFileAndGetURL(values.packagePhotoData, filePath);
        if (uploadResult.success && uploadResult.url) {
            photoUrl = uploadResult.url;
        } else {
            toast({
                variant: "destructive",
                title: "Photo Upload Failed",
                description: uploadResult.error || "Could not upload the package photo.",
            });
            setIsSubmitting(false);
            return;
        }
    }

    // Step 2: Save package data to Firestore with the photo URL
    const result = await addPackageEntry({
        recipient: values.recipient,
        courier: values.courier,
        trackingNumber: values.trackingNumber,
        packagePhotoUrl: photoUrl,
    });

    if (result.success) {
        toast({
            title: "Package Registered",
            description: `Package for ${values.recipient} has been logged.`,
        });
        onClose();
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "Could not save the package registration.",
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
            name="packagePhotoData"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center gap-2">
                <FormLabel>Package Photo (Optional)</FormLabel>
                <div className="relative h-32 w-48 rounded-md border-2 border-dashed bg-muted">
                    {field.value && <Image src={field.value} alt="Package Photo" layout="fill" objectFit="contain" className="rounded-md" />}
                </div>
                <Button type="button" variant="outline" onClick={() => setIsCameraOpen(true)} disabled={isSubmitting}>
                  {field.value ? "Retake Photo" : "Take Photo"}
                </Button>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recipient"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient (Apartment)</FormLabel>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="courier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Courier</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select courier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dhl">DHL</SelectItem>
                      <SelectItem value="fedex">FedEx</SelectItem>
                      <SelectItem value="ups">UPS</SelectItem>
                      <SelectItem value="usps">USPS</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="trackingNumber"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Tracking # (Optional)</FormLabel>
                    <FormControl>
                    <Input placeholder="1Z9999W99999999999" {...field} disabled={isSubmitting}/>
                    </FormControl>
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
              Register Package
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Capture Package Photo</DialogTitle>
          </DialogHeader>
          <CameraCapture onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
