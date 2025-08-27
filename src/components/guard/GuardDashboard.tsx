
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Footprints, Package, BookText, ShieldAlert, LogOut, History } from "lucide-react";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { endShift } from "@/app/actions";
import LocaleSwitcher from "../LocaleSwitcher";

interface GuardDashboardProps {
  shiftId: string;
  onOpenDialog: (dialog: string) => void;
  onEndShift: () => void;
}

export default function GuardDashboard({ shiftId, onOpenDialog, onEndShift }: GuardDashboardProps) {
  const [time, setTime] = useState(new Date());
  const [isEndingShift, setIsEndingShift] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    setIsEndingShift(true);
    const result = await endShift(shiftId);

    if (result.success) {
      try {
        await auth.signOut();
        onEndShift(); // Clear shift state in parent
        router.push('/');
        toast({
          title: "Shift Ended",
          description: "You have successfully ended your shift and logged out.",
        });
      } catch (error) {
        console.error("Logout error", error);
        toast({
          variant: "destructive",
          title: "Logout Failed",
          description: "Shift ended, but an error occurred while logging out.",
        });
      }
    } else {
       toast({
        variant: "destructive",
        title: "Shift End Failed",
        description: result.error || "Could not record shift end time.",
      });
    }
    setIsEndingShift(false);
  };

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const actions = [
    { name: "Vehicular Registration", icon: Car, dialog: "vehicle" },
    { name: "Pedestrian Registration", icon: Footprints, dialog: "pedestrian" },
    { name: "Package Management", icon: Package, dialog: "package" },
    { name: "Add to Logbook", icon: BookText, dialog: "logbook" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">Guard Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
              <div className="font-mono text-lg font-semibold">{formattedTime}</div>
              <div className="text-xs text-muted-foreground">{formattedDate}</div>
          </div>
          <LocaleSwitcher />
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Button
              key={action.name}
              className="h-32 transform transition-transform duration-200 hover:scale-105"
              variant="outline"
              onClick={() => onOpenDialog(action.dialog)}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <action.icon className="h-10 w-10 text-primary" />
                <span className="text-center font-semibold">{action.name}</span>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="text-center md:text-left">
                            <h3 className="font-semibold">Activity History</h3>
                            <p className="text-sm text-muted-foreground">Review recent vehicle, pedestrian, and logbook entries.</p>
                        </div>
                        <Button onClick={() => onOpenDialog('history')} className="w-full sm:w-auto">
                            <History className="mr-2 h-4 w-4" /> View History
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="text-center md:text-left">
                            <h3 className="font-semibold">Night Shift Alert</h3>
                            <p className="text-sm text-muted-foreground">Click to manually trigger a 'Proof of Life' alert.</p>
                        </div>
                        <Button onClick={() => onOpenDialog('proofOfLife')} variant="destructive" className="w-full sm:w-auto">
                            <ShieldAlert className="mr-2 h-4 w-4" /> Trigger Alert
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
      <footer className="shrink-0 border-t bg-card p-4">
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-muted-foreground" disabled={isEndingShift}>
          <LogOut className="mr-2 h-4 w-4" />
          End Shift
        </Button>
      </footer>
    </div>
  );
}

    