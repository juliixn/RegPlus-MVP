"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../AuthProvider";
import { startShift } from "@/app/actions";

interface StartShiftFormProps {
  onStartShift: (shiftId: string) => void;
}

export default function StartShiftForm({ onStartShift }: StartShiftFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!user) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to start a shift.",
        });
        setIsLoading(false);
        return;
    }

    const formData = new FormData(event.currentTarget);
    const condominium = formData.get('condominium') as string;
    const shiftType = formData.get('shift-type') as string;
    const equipment = Array.from(formData.keys()).filter(key => 
        (key === 'radio' || key === 'keys' || key === 'phone') && formData.get(key) === 'on'
    );
    
    if (!condominium || !shiftType) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please select a condominium and shift type.",
        });
        setIsLoading(false);
        return;
    }

    const result = await startShift({
        guardId: user.uid,
        guardName: user.displayName || user.email,
        condominium,
        shiftType,
        equipment,
    });

    if (result.success && result.shiftId) {
        toast({
            title: "Shift Started",
            description: "Your shift has been successfully started.",
        });
        onStartShift(result.shiftId);
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "An unexpected error occurred.",
        });
    }

    setIsLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                <ShieldCheck className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle>Start Your Shift</CardTitle>
            <CardDescription>
                Confirm your details to begin your duties.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="condo">Condominium</Label>
                <Select name="condominium" required>
                    <SelectTrigger id="condo">
                        <SelectValue placeholder="Select a condominium" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Sunset Villas">Sunset Villas</SelectItem>
                        <SelectItem value="Oceanview Heights">Oceanview Heights</SelectItem>
                        <SelectItem value="Greenwood Park">Greenwood Park</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="shift-type">Shift</Label>
                <Select name="shift-type" required>
                    <SelectTrigger id="shift-type">
                        <SelectValue placeholder="Select your shift" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="day">Diurno (Day)</SelectItem>
                        <SelectItem value="night">Nocturno (Night)</SelectItem>
                        <SelectItem value="support">Apoyo (Support)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Equipment Received</Label>
                <div className="space-y-2 rounded-md border p-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="radio" name="radio" />
                        <label htmlFor="radio" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Radio
                        </label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="keys" name="keys" />
                        <label htmlFor="keys" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Keys
                        </label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="phone" name="phone" />
                        <label htmlFor="phone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Mobile Phone
                        </label>
                    </div>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Shift
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

    