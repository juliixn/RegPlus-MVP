
"use client";

import { useEffect, useState, useCallback } from 'react';
import { getPendingUsers, approveUser, denyUser } from '@/app/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function ApprovalsPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPendingUsers();
      if (result.success && result.data) {
        setPendingUsers(result.data as PendingUser[]);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Could not load pending users.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fetching users.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleRoleChange = (userId: string, role: string) => {
    setSelectedRoles(prev => ({ ...prev, [userId]: role }));
  };

  const handleApprove = async (user: PendingUser) => {
    const role = selectedRoles[user.id];
    if (!role) {
      toast({
        variant: "destructive",
        title: "No Role Selected",
        description: `Please select a role for ${user.name}.`,
      });
      return;
    }
    setProcessingId(user.id);
    const result = await approveUser({ 
      uid: user.id, 
      role: role as any,
      name: user.name,
      email: user.email,
    });
    if (result.success) {
      toast({
        title: "User Approved",
        description: `${user.name} has been approved and can now log in.`,
      });
      fetchPendingUsers(); // Refresh the list
    } else {
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: result.error,
      });
    }
    setProcessingId(null);
  };
  
  const handleDeny = async (user: PendingUser) => {
    setProcessingId(user.id);
    const result = await denyUser(user.id);
    if (result.success) {
      toast({
        title: "User Denied",
        description: `${user.name}'s registration has been denied and their account deleted.`,
      });
      fetchPendingUsers(); // Refresh the list
    } else {
      toast({
        variant: "destructive",
        title: "Denial Failed",
        description: result.error,
      });
    }
     setProcessingId(null);
  };


  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Approvals</h2>
          <p className="text-muted-foreground">
            Review and assign roles to new user registrations.
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
                  <TableHead>Email</TableHead>
                  <TableHead>Registered At</TableHead>
                  <TableHead>Assign Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.length > 0 ? (
                  pendingUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell>
                        <Select onValueChange={(value) => handleRoleChange(user.id, value)}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="resident">Resident</SelectItem>
                            <SelectItem value="guard">Guard</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="titular_condo">Titular Condo</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {processingId === user.id ? (
                            <Loader2 className="h-5 w-5 animate-spin ml-auto" />
                        ) : (
                          <>
                            <Button size="icon" variant="outline" onClick={() => handleDeny(user)}>
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                            <Button size="icon" onClick={() => handleApprove(user)}>
                              <Check className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No pending user approvals.
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
