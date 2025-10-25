"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface ConfirmationStepProps {
  studentName: string;
  examName: string;
  onFinish: () => void;
  onBack: () => void;
}

export default function ConfirmationStep({ studentName, examName, onFinish, onBack }: ConfirmationStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Verification Complete</h2>
        <p className="text-muted-foreground">You're ready to begin your exam</p>
      </div>

      <Card className="p-6">
        <div className="text-center space-y-6">
          <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto" />
          
          <div>
            <h3 className="text-2xl font-bold">All Set!</h3>
            <p className="text-muted-foreground mt-2">
              {studentName}, you have completed all verification steps for {examName}
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <h4 className="font-medium">Important Reminders:</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Keep your webcam and microphone enabled</li>
              <li>• Stay within the camera frame</li>
              <li>• No additional screens or devices allowed</li>
              <li>• Your exam session will be monitored</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onFinish}>
          Start Exam
        </Button>
      </div>
    </div>
  );
}