"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, Mic, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface SystemCheckStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function SystemCheckStep({ onNext, onBack }: SystemCheckStepProps) {
  const [cameraStatus, setCameraStatus] = useState<"pending" | "success" | "error">("pending");
  const [micStatus, setMicStatus] = useState<"pending" | "success" | "error">("pending");
  const [isChecking, setIsChecking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    checkDevices();
    return () => {
      stopDevices();
    };
  }, []);

  async function checkDevices() {
    setIsChecking(true);
    try {
      // Check camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      
      // Setup video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStatus("success");
      }

      // Setup audio visualizer
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setMicStatus("success");

      // Start audio visualization
      visualizeAudio();
    } catch (err) {
      console.error("Device check error:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          toast.error("Please allow access to your camera and microphone");
        } else {
          toast.error("Error accessing devices. Please check your hardware");
        }
      }
      setCameraStatus("error");
      setMicStatus("error");
    } finally {
      setIsChecking(false);
    }
  }

  function visualizeAudio() {
    if (!analyserRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
      if (!ctx) return;
      requestAnimationFrame(draw);
      analyserRef.current?.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = "rgb(30, 41, 59)"; // slate-800
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for(let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(${barHeight + 100}, 134, 244)`;
        ctx.fillRect(x, canvas.height - barHeight/2, barWidth, barHeight/2);
        x += barWidth + 1;
      }
    }
    
    draw();
  }

  function stopDevices() {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  }

  const allChecksPass = cameraStatus === "success" && micStatus === "success";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">System Check</h2>
        <p className="text-muted-foreground">Let's verify your camera and microphone</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Camera Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                <h3 className="font-semibold">Camera</h3>
              </div>
              <StatusIndicator status={cameraStatus} />
            </div>
            <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
              {isChecking ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Microphone Visualizer */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                <h3 className="font-semibold">Microphone</h3>
              </div>
              <StatusIndicator status={micStatus} />
            </div>
            <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-4">
              {isChecking ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : micStatus === "success" ? (
                <canvas
                  ref={canvasRef}
                  width="300"
                  height="100"
                  className="w-full"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Microphone access required</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Retry button shown on error */}
        {(cameraStatus === "error" || micStatus === "error") && (
          <Button 
            variant="outline" 
            onClick={checkDevices}
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? "Checking..." : "Retry Device Check"}
          </Button>
        )}
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button disabled={!allChecksPass} onClick={onNext}>
          Continue to Face Verification
        </Button>
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: "pending" | "success" | "error" }) {
  const variants = {
    pending: "text-yellow-500",
    success: "text-green-500",
    error: "text-red-500"
  };

  const labels = {
    pending: "Checking...",
    success: "Connected",
    error: "Error"
  };

  return (
    <div className={`flex items-center gap-1.5 ${variants[status]}`}>
      <span className="text-sm">{labels[status]}</span>
      {status === "pending" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : status === "success" ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
    </div>
  );
}