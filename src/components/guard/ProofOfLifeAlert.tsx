"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import CameraCapture from './CameraCapture';
import { useToast } from '@/hooks/use-toast';
import { User, Building, Loader2 } from 'lucide-react';
import { submitProofOfLife } from '@/app/actions';

interface ProofOfLifeAlertProps {
  isOpen: boolean;
  onClose: () => void;
  shiftId: string;
  guardId: string;
}

export default function ProofOfLifeAlert({ isOpen, onClose, shiftId, guardId }: ProofOfLifeAlertProps) {
  const [selfie, setSelfie] = useState<string | null>(null);
  const [surroundings, setSurroundings] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'selfie' | 'surroundings' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleCapture = (imageDataUri: string) => {
    if (cameraTarget === 'selfie') {
      setSelfie(imageDataUri);
    } else if (cameraTarget === 'surroundings') {
      setSurroundings(imageDataUri);
    }
    setIsCameraOpen(false);
    setCameraTarget(null);
  };

  const openCamera = (target: 'selfie' | 'surroundings') => {
    setCameraTarget(target);
    setIsCameraOpen(true);
  };
  
  const handleSubmit = async () => {
    if (!selfie || !surroundings) {
        toast({
            variant: "destructive",
            title: "Incomplete",
            description: "Please provide both a selfie and a photo of your surroundings.",
        });
        return;
    }
    setIsSubmitting(true);
    
    const result = await submitProofOfLife({ shiftId, guardId, selfie, surroundings });

    if (result.success) {
        toast({
            title: "Proof of Life Submitted",
            description: "Your status has been confirmed.",
        });
        setSelfie(null);
        setSurroundings(null);
        onClose();
    } else {
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: result.error || "Could not submit proof of life.",
        });
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Proof of Life Required</DialogTitle>
            <DialogDescription>
              Please take a selfie and a photo of your surroundings to confirm you are active at your post.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex flex-col items-center gap-2">
                <div className="relative flex h-32 w-full items-center justify-center rounded-md border-2 border-dashed bg-muted">
                    {selfie ? <Image src={selfie} alt="Selfie" layout="fill" objectFit="cover" className="rounded-md" /> : <User className="h-10 w-10 text-muted-foreground" />}
                </div>
                <Button variant="outline" size="sm" onClick={() => openCamera('selfie')}>Take Selfie</Button>
            </div>
             <div className="flex flex-col items-center gap-2">
                <div className="relative flex h-32 w-full items-center justify-center rounded-md border-2 border-dashed bg-muted">
                    {surroundings ? <Image src={surroundings} alt="Surroundings" layout="fill" objectFit="cover" className="rounded-md" /> : <Building className="h-10 w-10 text-muted-foreground" />}
                </div>
                <Button variant="outline" size="sm" onClick={() => openCamera('surroundings')}>Take Surroundings Photo</Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="destructive" className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Proof
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Capture {cameraTarget === 'selfie' ? 'Selfie' : 'Surroundings'}</DialogTitle>
          </DialogHeader>
          <CameraCapture onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} aspectRatio={0.75} />
        </DialogContent>
      </Dialog>
    </>
  );
}
