"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck } from "lucide-react";

interface StartShiftFormProps {
  onStartShift: () => void;
}

export default function StartShiftForm({ onStartShift }: StartShiftFormProps) {

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onStartShift();
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
                <Select required>
                    <SelectTrigger id="condo">
                        <SelectValue placeholder="Select a condominium" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="condo-a">Sunset Villas</SelectItem>
                        <SelectItem value="condo-b">Oceanview Heights</SelectItem>
                        <SelectItem value="condo-c">Greenwood Park</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="shift-type">Shift</Label>
                <Select required>
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
                        <Checkbox id="radio" />
                        <label htmlFor="radio" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Radio
                        </label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="keys" />
                        <label htmlFor="keys" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Keys
                        </label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="phone" />
                        <label htmlFor="phone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Mobile Phone
                        </label>
                    </div>
                </div>
            </div>

            <Button type="submit" className="w-full">
              Start Shift
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
