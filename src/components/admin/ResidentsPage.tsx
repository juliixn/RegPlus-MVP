
"use client";

import { useEffect, useState, useCallback } from 'react';
import { getResidents } from '@/app/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Resident {
  id: string;
  name: string;
  apartment: string;
  email?: string;
  phone?: string;
}

export default function ResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchResidents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getResidents();
      if (result.success && result.data) {
        setResidents(result.data as Resident[]);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not load residents.",
        });
      }
    } catch (error) {
      console.error("Failed to fetch residents", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fetching residents.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Residents</h2>
          <p className="text-muted-foreground">
            Manage the residents of the condominium. New residents are added via the User Approvals page.
          </p>
        </div>
      </div>
      <Card>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Apartment</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residents.length > 0 ? (
                  residents.map((resident) => (
                    <TableRow key={resident.id}>
                      <TableCell>{resident.name}</TableCell>
                      <TableCell>{resident.apartment}</TableCell>
                      <TableCell>{resident.email || 'N/A'}</TableCell>
                      <TableCell>{resident.phone || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No residents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
