"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, Check, RefreshCcw } from "lucide-react";

interface FaceVerificationStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function FaceVerificationStep({ onNext, onBack }: FaceVerificationStepProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      toast.error("Failed to access camera");
    }
  }

  function stopCamera() {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  }

  async function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    try {
      // Play capture animation
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageData);
      toast.success("Photo captured successfully!");
    } catch (error) {
      toast.error("Failed to capture photo");
    } finally {
      setIsCapturing(false);
    }
  }

  function retake() {
    setCapturedImage(null);
    startCamera();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Face Verification</h2>
        <p className="text-muted-foreground">
          Please center your face in the frame and ensure good lighting
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
            {/* Face guide overlay */}
            {isCameraActive && !capturedImage && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-white/50 rounded-full"></div>
              </div>
            )}
            
            {/* Video feed or captured image */}
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured face"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            )}
            
            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Capture animation overlay */}
            {isCapturing && (
              <div className="absolute inset-0 bg-white/20 animate-flash" />
            )}
          </div>

          <div className="flex gap-3 justify-center">
            {!capturedImage ? (
              <Button 
                onClick={capturePhoto}
                disabled={!isCameraActive || isCapturing}
              >
                <Camera className="w-4 h-4 mr-2" />
                {isCapturing ? "Capturing..." : "Take Photo"}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={retake}>
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Retake Photo
                </Button>
                <Button onClick={onNext}>
                  <Check className="w-4 h-4 mr-2" />
                  Confirm & Continue
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}