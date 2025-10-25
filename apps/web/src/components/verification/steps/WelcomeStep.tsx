"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";

interface WelcomeStepProps {
  studentName: string;
  examName: string;
  onNext: () => void;
}

export default function WelcomeStep({ studentName, examName, onNext }: WelcomeStepProps) {
  const [agreed, setAgreed] = useState(false);

  const rules = [
    "Webcam must remain enabled and unobstructed throughout the exam",
    "Microphone must remain enabled to monitor audio",
    "No additional screens or devices are allowed",
    "Your face must remain visible in the camera frame",
    "Room must be well-lit and quiet",
    "No other people are allowed in the room",
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Exam Verification: {examName}</h2>
        <p className="text-muted-foreground">Welcome, {studentName}</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Exam Rules</h3>
              <ul className="space-y-3">
                {rules.map((rule, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-4 border-t">
            <Checkbox 
              id="rules-agree" 
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <label htmlFor="rules-agree" className="text-sm leading-none">
              I understand and agree to follow these exam rules
            </label>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button disabled={!agreed} onClick={onNext}>
          Continue to System Check
        </Button>
      </div>
    </div>
  );
}