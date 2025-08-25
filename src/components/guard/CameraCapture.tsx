"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CameraCaptureProps {
  onCapture: (imageDataUri: string) => void;
  onClose: () => void;
  aspectRatio?: number;
}

export default function CameraCapture({ onCapture, onClose, aspectRatio = 1.5 }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setCapturedImage(null);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const handleCapture = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUri);
        stopCamera();
      }
    }
  }, [videoRef, stopCamera]);
  
  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  }

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-background rounded-lg">
      <div className="relative w-full overflow-hidden rounded-md border" style={{ aspectRatio }}>
        {error && <div className="absolute inset-0 flex items-center justify-center bg-muted text-destructive-foreground p-4">{error}</div>}
        
        {capturedImage && (
            <Image src={capturedImage} alt="Captured image" layout="fill" objectFit="contain" />
        )}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={cn("h-full w-full object-cover", { 'hidden': capturedImage || !stream })}
        />
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" size="icon" onClick={onClose} aria-label="Close Camera">
          <X />
        </Button>
        {!capturedImage ? (
          <Button size="icon" onClick={handleCapture} disabled={!stream} aria-label="Capture Photo">
            <Camera />
          </Button>
        ) : (
          <Button size="icon" onClick={startCamera} aria-label="Retake Photo">
            <RefreshCw />
          </Button>
        )}
        <Button variant="default" onClick={handleConfirm} disabled={!capturedImage}>
          Confirm
        </Button>
      </div>
    </div>
  );
}
