"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Camera, CheckCircle2, RotateCcw, XCircle } from "lucide-react";

interface RoomScanStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function RoomScanStep({ onNext, onBack }: RoomScanStepProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const SCAN_DURATION = 15; // seconds

  async function startScan() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      setIsRecording(true);
      setProgress(0);
      mediaRecorder.start();

      // Progress timer
      const startTime = Date.now();
      const timer = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const percentage = (elapsed / SCAN_DURATION) * 100;
        
        if (elapsed >= SCAN_DURATION) {
          clearInterval(timer);
          mediaRecorder.stop();
          setIsRecording(false);
          setIsComplete(true);
          setProgress(100);
          toast.success("Room scan completed!");
        } else {
          setProgress(percentage);
        }
      }, 100);

    } catch (err) {
      toast.error("Failed to access camera");
      setIsRecording(false);
    }
  }

  function resetScan() {
    setIsRecording(false);
    setProgress(0);
    setIsComplete(false);
    setRecordedBlob(null);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Room Scan</h2>
        <p className="text-muted-foreground">
          Please do a complete 360° scan of your room
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center relative">
            {isComplete ? (
              <div className="text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-green-500">Scan Complete!</p>
              </div>
            ) : isRecording ? (
              <div className="text-center">
                <Camera className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <p className="text-lg font-medium">Recording Room Scan...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please slowly pan your camera 360°
                </p>
              </div>
            ) : (
              <div className="text-center p-6">
                <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Ready to scan your room</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Click "Start Scan" and slowly rotate your device/camera in a complete circle to show your entire room
                </p>
              </div>
            )}

            {/* Recording progress bar */}
            {(isRecording || isComplete) && (
              <div className="absolute bottom-0 inset-x-0 p-4">
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{Math.round(progress)}%</span>
                    <span>{Math.ceil((SCAN_DURATION * (100 - progress)) / 100)}s remaining</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            {!isRecording && !isComplete && (
              <Button onClick={startScan}>
                <Camera className="w-4 h-4 mr-2" />
                Start Room Scan
              </Button>
            )}
            
            {isComplete && (
              <>
                <Button variant="outline" onClick={resetScan}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Scan
                </Button>
                <Button onClick={onNext}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              </>
            )}
            
            {isRecording && (
              <Button 
                variant="destructive" 
                onClick={resetScan}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Scan
              </Button>
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