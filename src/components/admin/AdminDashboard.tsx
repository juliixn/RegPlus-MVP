"use client";

import { useEffect, useState } from "react";
import HistoryLog from "@/components/guard/HistoryLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, Footprints, Package, Loader2 } from "lucide-react";
import { getDashboardStats } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalResidents: number;
  vehicleEntriesToday: number;
  pedestrianEntriesToday: number;
  pendingPackages: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const result = await getDashboardStats();
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load dashboard statistics.",
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, [toast]);

  const renderStatCard = (title: string, value: number | undefined, Icon: React.ElementType, description: string) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-10 flex items-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value ?? 0}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderStatCard("Total Residents", stats?.totalResidents, Users, "Currently registered")}
        {renderStatCard("Vehicle Entries Today", stats?.vehicleEntriesToday, Car, "Entries since midnight")}
        {renderStatCard("Pedestrian Entries Today", stats?.pedestrianEntriesToday, Footprints, "Entries since midnight")}
        {renderStatCard("Pending Packages", stats?.pendingPackages, Package, "Waiting for pickup")}
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <HistoryLog />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
