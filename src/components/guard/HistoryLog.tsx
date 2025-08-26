"use client";

import { useEffect, useState } from 'react';
import { getVehicleEntries, getPedestrianEntries, getLogbookEntries, getPackageEntries } from '@/app/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Entry {
  id: string;
  [key: string]: any;
}

export default function HistoryLog() {
  const [vehicleData, setVehicleData] = useState<Entry[]>([]);
  const [pedestrianData, setPedestrianData] = useState<Entry[]>([]);
  const [logbookData, setLogbookData] = useState<Entry[]>([]);
  const [packageData, setPackageData] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [vehicles, pedestrians, logbook, packages] = await Promise.all([
          getVehicleEntries(),
          getPedestrianEntries(),
          getLogbookEntries(),
          getPackageEntries(),
        ]);

        if (vehicles.success && vehicles.data) setVehicleData(vehicles.data);
        if (pedestrians.success && pedestrians.data) setPedestrianData(pedestrians.data);
        if (logbook.success && logbook.data) setLogbookData(logbook.data);
        if (packages.success && packages.data) setPackageData(packages.data);

      } catch (error) {
        console.error("Failed to fetch history logs", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load activity history.",
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [toast]);
  
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-4">
        <Tabs defaultValue="vehicles">
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="pedestrians">Pedestrians</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="logbook">Logbook</TabsTrigger>
        </TabsList>
        <ScrollArea className="h-96 w-full">
            <TabsContent value="vehicles">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Plate</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Destination</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vehicleData.map((v) => (
                        <TableRow key={v.id}>
                            <TableCell>{v.timestamp}</TableCell>
                            <TableCell>{v.licensePlate}</TableCell>
                            <TableCell>{v.driverName}</TableCell>
                            <TableCell>{v.destination}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabsContent>
            <TabsContent value="pedestrians">
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Destination</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pedestrianData.map((p) => (
                        <TableRow key={p.id}>
                            <TableCell>{p.timestamp}</TableCell>
                            <TableCell>{p.visitorName}</TableCell>
                            <TableCell>{p.visitorType}</TableCell>
                            <TableCell>{p.destination}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabsContent>
             <TabsContent value="packages">
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Received At</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Courier</TableHead>
                        <TableHead>Tracking #</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {packageData.map((p) => (
                        <TableRow key={p.id}>
                            <TableCell>{p.receivedAt}</TableCell>
                            <TableCell>{p.recipient}</TableCell>
                            <TableCell>{p.courier}</TableCell>
                            <TableCell>{p.trackingNumber}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabsContent>
            <TabsContent value="logbook">
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Entry</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logbookData.map((l) => (
                        <TableRow key={l.id}>
                            <TableCell>{l.timestamp}</TableCell>
                            <TableCell className="max-w-xs truncate">{l.entry}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabsContent>
        </ScrollArea>
        </Tabs>
    </div>
  );
}
