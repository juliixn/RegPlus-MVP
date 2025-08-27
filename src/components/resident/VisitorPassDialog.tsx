"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { QRCode } from "react-qrcode-logo";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { generateVisitorPass } from "@/app/actions";

interface VisitorPassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  residentId: string;
}

const formSchema = z.object({
  visitorName: z.string().min(3, { message: "Visitor name must be at least 3 characters." }),
  visitDate: z.date({ required_error: "A visit date is required." }),
});

export default function VisitorPassDialog({ isOpen, onClose, residentId }: VisitorPassDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPass, setGeneratedPass] = useState<any | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitorName: "",
    },
  });

  const handleDialogClose = () => {
    form.reset();
    setGeneratedPass(null);
    onClose();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const result = await generateVisitorPass({
        ...values,
        residentId,
    });
    
    if (result.success && result.passData) {
        setGeneratedPass(result.passData);
        toast({
            title: "Pass Generated",
            description: "Your visitor pass has been created successfully.",
        });
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "Could not generate the pass.",
        });
    }

    setIsSubmitting(false);
  };
  
  const qrCodeValue = generatedPass ? JSON.stringify(generatedPass) : "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDialogClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{generatedPass ? "Visitor Pass" : "Generate Visitor Pass"}</DialogTitle>
          <DialogDescription>
            {generatedPass ? "Share this QR code with your visitor for easy access." : "Fill in the details to create a pass for your visitor."}
          </DialogDescription>
        </DialogHeader>
        {generatedPass ? (
            <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-white rounded-lg border">
                    <QRCode value={qrCodeValue} size={200} />
                </div>
                <div className="text-center">
                    <p className="font-semibold text-lg">{generatedPass.visitorName}</p>
                    <p className="text-muted-foreground">Valid for: {generatedPass.visitDate}</p>
                </div>
                <Button onClick={handleDialogClose}>Close</Button>
            </div>
        ) : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                control={form.control}
                name="visitorName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Visitor's Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="John Doe" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="visitDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Date of Visit</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            disabled={isSubmitting}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <DialogFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Pass
                    </Button>
                </DialogFooter>
            </form>
            </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

    