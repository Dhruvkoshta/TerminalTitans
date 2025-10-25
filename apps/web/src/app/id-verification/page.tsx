"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, Upload, RefreshCcw, Check, RotateCcw, Image as ImageIcon } from "lucide-react";

export default function IDVerificationPage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    return () => {
      // Cleanup: ensure camera is stopped when component unmounts
      stopCamera();
    };
  }, []);

  async function startCamera() {
    try {
      stopCamera(); // Stop any existing streams
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play(); // Ensure video is playing
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Failed to access camera. Please check permissions.");
    }
  }

  function stopCamera() {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  }

  function switchCamera() {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    if (isCameraActive) {
      startCamera(); // Restart camera with new facing mode
    }
  }

  async function capturePhoto() {
    if (videoRef.current && canvasRef.current) {
      try {
        // Get the video dimensions
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;

        // Set canvas dimensions to match video
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        // Draw the current video frame to the canvas
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        // Handle different facingModes
        if (facingMode === "user") {
          // Mirror the image for front camera
          ctx.translate(videoWidth, 0);
          ctx.scale(-1, 1);
        }
        
        ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

        // Convert to image
        const imageData = canvasRef.current.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageData);
        stopCamera();
        toast.success("Photo captured successfully!");
      } catch (error) {
        console.error("Capture error:", error);
        toast.error("Failed to capture photo. Please try again.");
      }
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function submitVerification() {
    if (!capturedImage) return;
    
    setIsVerifying(true);
    try {
      // Here you would typically send the image to your backend
      // For demo, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("ID verification submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit verification. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">ID Verification</h1>
          <p className="text-muted-foreground">
            Please verify your identity by uploading or capturing a photo of your ID
          </p>
        </div>

        <Card className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="aspect-video bg-muted relative rounded-lg overflow-hidden">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="opacity-75 hover:opacity-100"
                        onClick={switchCamera}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured ID"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No image captured</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {!isCameraActive && (
                  <Button onClick={startCamera} className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                )}
                {isCameraActive && (
                  <Button onClick={capturePhoto} variant="secondary" className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                )}
                <div className="relative flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isCameraActive}
                  />
                  <Button variant="secondary" className="w-full" disabled={isCameraActive}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload ID
                  </Button>
                </div>
                {capturedImage && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCapturedImage(null);
                      stopCamera();
                    }}
                    className="flex-1"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Requirements:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Government-issued ID (passport, driver's license)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Ensure all corners are visible
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Well-lit environment
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Clear, non-blurry image
                  </li>
                </ul>
              </div>

              <Button 
                onClick={submitVerification} 
                disabled={!capturedImage || isVerifying}
                className="w-full"
              >
                {isVerifying ? "Verifying..." : "Submit for Verification"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}