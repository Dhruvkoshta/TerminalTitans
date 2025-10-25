"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import WelcomeStep from "./steps/WelcomeStep";
import SystemCheckStep from "./steps/SystemCheckStep";
import FaceVerificationStep from "./steps/FaceVerificationStep";
import RoomScanStep from "./steps/RoomScanStep";
import ConfirmationStep from "./steps/ConfirmationStep";

interface VerificationWizardProps {
  examId: string;
  examName: string;
  studentName: string;
}

export default function VerificationWizard({ 
  examId, 
  examName, 
  studentName 
}: VerificationWizardProps) {
  const [step, setStep] = useState(1);
  const router = useRouter();
  
  // Track verification data
  const [verificationData, setVerificationData] = useState({
    rulesAgreed: false,
    systemCheck: {
      webcam: false,
      microphone: false
    },
    facePhoto: null as string | null,
    roomScan: null as string | null
  });

  useEffect(() => {
    // Clean up any active media streams when unmounting
    return () => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(() => {});
    };
  }, []);

  function nextStep() {
    setStep(prev => prev + 1);
  }

  function previousStep() {
    setStep(prev => prev - 1);
  }

  async function onComplete() {
    try {
      // Here you would typically submit the verification data to your backend
      await fetch('/api/exams/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId,
          ...verificationData
        })
      });
      
      toast.success("Verification completed successfully!");
      router.push(`/test?exam_id=${examId}`);
    } catch (error) {
      toast.error("Failed to complete verification. Please try again.");
    }
  }

  const steps = [
    { name: "Welcome & Rules", description: "Review and accept exam rules" },
    { name: "System Check", description: "Verify webcam and microphone" },
    { name: "Face Verification", description: "Capture a clear photo of your face" },
    { name: "Room Scan", description: "Show your exam environment" },
    { name: "Ready to Begin", description: "Start your exam" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Progress bar */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            {steps.map(({ name, description }, index) => (
              <div 
                key={name}
                className={`flex flex-col items-center gap-2 ${
                  index + 1 === step
                    ? "text-primary"
                    : index + 1 < step
                    ? "text-primary/60"
                    : "text-muted-foreground"
                }`}
              >
                <div className="hidden sm:flex flex-col text-center gap-1 max-w-[120px]">
                  <span className="font-medium">{name}</span>
                  <span className="text-xs text-muted-foreground">{description}</span>
                </div>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    index + 1 === step
                      ? "border-primary bg-primary/10"
                      : index + 1 < step
                      ? "border-primary/60 bg-primary/60"
                      : "border-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div>
          {step === 1 && (
            <WelcomeStep
              studentName={studentName}
              examName={examName}
              onNext={nextStep}
            />
          )}
          {step === 2 && (
            <SystemCheckStep
              onNext={nextStep}
              onBack={previousStep}
            />
          )}
          {step === 3 && (
            <FaceVerificationStep
              onNext={nextStep}
              onBack={previousStep}
            />
          )}
          {step === 4 && (
            <RoomScanStep
              onNext={nextStep}
              onBack={previousStep}
            />
          )}
          {step === 5 && (
            <ConfirmationStep
              studentName={studentName}
              examName={examName}
              onFinish={onComplete}
              onBack={previousStep}
            />
          )}
        </div>
      </div>
    </div>
  );
}