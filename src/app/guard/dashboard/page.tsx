"use client";

import { useState } from "react";
import StartShiftForm from "@/components/guard/StartShiftForm";
import GuardDashboard from "@/components/guard/GuardDashboard";
import VehicleRegistrationForm from "@/components/guard/VehicleRegistrationForm";
import PedestrianRegistrationForm from "@/components/guard/PedestrianRegistrationForm";
import LogbookForm from "@/components/guard/LogbookForm";
import ProofOfLifeAlert from "@/components/guard/ProofOfLifeAlert";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function GuardPage() {
  const [shiftStarted, setShiftStarted] = useState(false);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const handleStartShift = () => {
    setShiftStarted(true);
  };

  const openDialog = (dialog: string) => setActiveDialog(dialog);
  const closeDialog = () => setActiveDialog(null);

  if (!shiftStarted) {
    return <StartShiftForm onStartShift={handleStartShift} />;
  }

  return (
    <>
      <GuardDashboard onOpenDialog={openDialog} />

      <Dialog open={activeDialog === 'vehicle'} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Vehicular Registration</DialogTitle>
          </DialogHeader>
          <VehicleRegistrationForm onClose={closeDialog} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={activeDialog === 'pedestrian'} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Pedestrian Registration</DialogTitle>
          </DialogHeader>
          <PedestrianRegistrationForm onClose={closeDialog} />
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'logbook'} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Logbook</DialogTitle>
          </DialogHeader>
          <LogbookForm onClose={closeDialog} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={activeDialog === 'package'} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Package Management</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-center text-muted-foreground">Package management functionality coming soon.</p>
        </DialogContent>
      </Dialog>

      <ProofOfLifeAlert
        isOpen={activeDialog === 'proofOfLife'}
        onClose={closeDialog}
      />
    </>
  );
}
