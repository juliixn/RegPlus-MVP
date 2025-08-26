"use client";

import { useEffect, useState, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getCommunications, addCommunication } from '@/app/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

interface Communication {
  id: string;
  title: string;
  content: string;
  audience: string;
  sentAt: string;
}

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  audience: z.string({ required_error: "Please select an audience." }),
});

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const fetchCommunications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCommunications();
      if (result.success && result.data) {
        setCommunications(result.data as Communication[]);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not load communications.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fetching communications.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCommunications();
  }, [fetchCommunications]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const result = await addCommunication(values);
    if (result.success) {
      toast({
        title: "Communication Sent",
        description: "Your message has been successfully sent.",
      });
      form.reset();
      fetchCommunications(); // Refresh the list
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not send the communication.",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Communications</h2>
          <p className="text-muted-foreground">
            Send announcements and view past communications.
          </p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Communication</CardTitle>
            <CardDescription>Compose a new message for residents or guards.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Pool Maintenance" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Please be advised that..." className="min-h-[150px]" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="audience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audience</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select who will receive this" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all_residents">All Residents</SelectItem>
                          <SelectItem value="all_guards">All Guards</SelectItem>
                          <SelectItem value="all">Everyone</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Communication
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sent Communications</CardTitle>
            <CardDescription>A log of all previously sent messages.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
                <ScrollArea className="h-[400px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Audience</TableHead>
                            <TableHead>Sent At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {communications.length > 0 ? (
                            communications.map((comm) => (
                                <TableRow key={comm.id}>
                                <TableCell className="font-medium">{comm.title}</TableCell>
                                <TableCell>{comm.audience.replace('_', ' ')}</TableCell>
                                <TableCell>{comm.sentAt}</TableCell>
                                </TableRow>
                            ))
                            ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                No communications found.
                                </TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
