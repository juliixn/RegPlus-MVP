"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TitularDashboard() {

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, Titular!</CardTitle>
            <CardDescription>This is your dedicated portal for condominium oversight.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
                This area is designated for high-level management, financial reports, and overall condominium administration. 
                Currently, it serves as a placeholder for future functionality.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
