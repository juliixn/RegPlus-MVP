"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QrCode, Bell, Package, Loader2 } from "lucide-react";
import { getCommunications, getPackageEntries } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import VisitorPassDialog from "./VisitorPassDialog";
import { useAuth } from "../AuthProvider";

interface Communication {
  id: string;
  title: string;
  content: string;
  audience: string;
  sentAt: string;
}

interface Package {
    id: string;
    recipient: string;
    courier: string;
    trackingNumber?: string;
    receivedAt: string;
    status: string;
}

export default function ResidentDashboard() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPassDialogOpen, setIsPassDialogOpen] = useState(false);
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [commsResult, packagesResult] = await Promise.all([
        getCommunications(),
        getPackageEntries(),
      ]);

      if (commsResult.success && commsResult.data) {
        const residentComms = commsResult.data.filter(
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

      if (packagesResult.success && packagesResult.data) {
        // In a real app, you'd filter by residentId/apartment. For demo, we show all pending.
        const pendingPackages = packagesResult.data.filter((p: any) => p.status === 'received') as Package[];
        setPackages(pendingPackages);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load package information.",
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [toast]);

  return (
    <>
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
                  <Button className="mt-4 w-full" onClick={() => setIsPassDialogOpen(true)}>Generate Pass</Button>
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
                  <Button className="mt-4 w-full" variant="outline" onClick={() => document.getElementById('comms-section')?.scrollIntoView({ behavior: 'smooth' })}>View Messages</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Packages</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Loader2 className="mt-2 h-5 w-5 animate-spin" />
                  ) : (
                    <p className="text-xs text-muted-foreground">You have {packages.length} package(s) waiting for pickup at the gate.</p>
                  )}
                  <Button className="mt-4 w-full" variant="outline" onClick={() => setIsPackageDialogOpen(true)}>View Packages</Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        
        <Card id="comms-section">
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

      {user && (
        <VisitorPassDialog 
          isOpen={isPassDialogOpen}
          onClose={() => setIsPassDialogOpen(false)}
          residentId={user.uid}
        />
      )}
      
      <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pending Packages</DialogTitle>
            <DialogDescription>
              Here are the packages waiting for you at the security gate.
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Received</TableHead>
                <TableHead>Courier</TableHead>
                <TableHead>Tracking #</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length > 0 ? (
                packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>{pkg.receivedAt}</TableCell>
                    <TableCell>{pkg.courier}</TableCell>
                    <TableCell>{pkg.trackingNumber || 'N/A'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    You have no pending packages.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </>
  );
}
