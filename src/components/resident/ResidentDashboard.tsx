"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { QrCode, Bell, Package, Loader2 } from "lucide-react";
import { getCommunications } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

interface Communication {
  id: string;
  title: string;
  content: string;
  audience: string;
  sentAt: string;
}

export default function ResidentDashboard() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCommunications = async () => {
      setLoading(true);
      const result = await getCommunications();
      if (result.success && result.data) {
        // Filter for resident-facing communications
        const residentComms = result.data.filter(
          (c: any) => c.audience === 'all_residents' || c.audience === 'all'
        ) as Communication[];
        setCommunications(residentComms);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load communications.",
        });
      }
      setLoading(false);
    };

    fetchCommunications();
  }, [toast]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back!</CardTitle>
          <CardDescription>Here's a quick overview of your condominium status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Visit</CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Generate a QR code for your guests for quick access.</p>
                <Button className="mt-4 w-full">Generate Pass</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Communications</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                    <Loader2 className="mt-2 h-5 w-5 animate-spin" />
                ) : (
                    <p className="text-xs text-muted-foreground">
                    You have {communications.length} unread messages from the administration.
                    </p>
                )}
                 <Button className="mt-4 w-full" variant="outline">View Messages</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Packages</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">You have 1 package waiting for pickup at the gate.</p>
                 <Button className="mt-4 w-full" variant="outline">View Packages</Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Communications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
          ) : communications.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {communications.map((comm) => (
                <AccordionItem value={comm.id} key={comm.id}>
                  <AccordionTrigger>
                    <div className="flex flex-col items-start text-left">
                      <span className="font-semibold">{comm.title}</span>
                      <span className="text-xs font-normal text-muted-foreground">{comm.sentAt}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {comm.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
             <p className="text-sm text-muted-foreground">No recent communications to display.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
