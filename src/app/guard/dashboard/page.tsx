"use client";

import { useState, useEffect } from "react";
import StartShiftForm from "@/components/guard/StartShiftForm";
import GuardDashboard from "@/components/guard/GuardDashboard";
import VehicleRegistrationForm from "@/components/guard/VehicleRegistrationForm";
import PedestrianRegistrationForm from "@/components/guard/PedestrianRegistrationForm";
import LogbookForm from "@/components/guard/LogbookForm";
import PackageRegistrationForm from "@/components/guard/PackageRegistrationForm";
import ProofOfLifeAlert from "@/components/guard/ProofOfLifeAlert";
import HistoryLog from "@/components/guard/HistoryLog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/AuthProvider";

export default function GuardPage() {
  const [shiftId, setShiftId] = useState<string | null>(null);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    // Check local storage for an active shift when component mounts
    const activeShiftId = localStorage.getItem('activeShiftId');
    if (activeShiftId) {
      setShiftId(activeShiftId);
    }
  }, []);

  const handleStartShift = (newShiftId: string) => {
    localStorage.setItem('activeShiftId', newShiftId);
    setShiftId(newShiftId);
  };

  const handleEndShift = () => {
    localStorage.removeItem('activeShiftId');
    setShiftId(null);
  }

  const openDialog = (dialog: string) => setActiveDialog(dialog);
  const closeDialog = () => setActiveDialog(null);

  if (!shiftId || !user) {
    return <StartShiftForm onStartShift={handleStartShift} />;
  }

  return (
    <>
      <GuardDashboard onOpenDialog={openDialog} onEndShift={handleEndShift} shiftId={shiftId} />

      <Dialog open={activeDialog === 'vehicle'} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
        <DialogContent className="sm:max-w-[600px] max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vehicular Registration</DialogTitle>
          </DialogHeader>
          <VehicleRegistrationForm onClose={closeDialog} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={activeDialog === 'pedestrian'} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
        <DialogContent className="sm:max-w-[600px] max-h-screen overflow-y-auto">
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
        <DialogContent className="sm:max-w-[600px] max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Package Management</DialogTitle>
          </DialogHeader>
          <PackageRegistrationForm onClose={closeDialog} />
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'history'} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
        <DialogContent className="sm:max-w-[800px] max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Activity History</DialogTitle>
          </DialogHeader>
          <HistoryLog />
        </DialogContent>
      </Dialog>

      <ProofOfLifeAlert
        isOpen={activeDialog === 'proofOfLife'}
        onClose={closeDialog}
        shiftId={shiftId}
        guardId={user.uid}
      />
    </>
  );
}
