"use client";

import { useEffect, useState, useCallback } from 'react';
import { getGuards } from '@/app/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GuardForm from './GuardForm';

interface Guard {
  id: string;
  name: string;
  email: string;
}

export default function GuardsPage() {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGuards = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getGuards();
      if (result.success && result.data) {
        setGuards(result.data as Guard[]);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not load guards.",
        });
      }
    } catch (error) {
      console.error("Failed to fetch guards", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fetching guards.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGuards();
  }, [fetchGuards]);

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Guards</h2>
          <p className="text-muted-foreground">
            Manage the security guards.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <GuardForm onSuccess={fetchGuards} />
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
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guards.length > 0 ? (
                  guards.map((guard) => (
                    <TableRow key={guard.id}>
                      <TableCell>{guard.name}</TableCell>
                      <TableCell>{guard.email}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      No guards found.
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
