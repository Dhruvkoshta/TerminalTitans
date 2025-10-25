"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function StudentDashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const [examCode, setExamCode] = useState("");
  const [status, setStatus] = useState<string>("");

  async function startExam() {
    try {
      const res = await fetch(`/api/exams/examByCode?exam_code=${encodeURIComponent(examCode)}`);
      const data = await res.json();
      if (!res.ok) {
        setStatus("Exam code is invalid");
        return;
      }
      const start = new Date(data.date_time_start ?? data.dateTimeStart);
      const duration = Number(data.duration);
      const end = new Date(start.getTime() + duration * 60 * 1000);
      const now = new Date();
      if (now >= start && now < end) {
        const diff = end.getTime() - now.getTime();
        const diff_mins = Math.floor(diff / 60000);
        const diff_secs = Math.floor((diff % 60000) / 1000);
        setStatus("Starting exam");
        const payload = {
          exam_code: examCode,
          student_name: session.user?.name,
          student_email: session.user?.email,
          exam_link: data.exam_link ?? data.examLink,
          prof_email: data.prof_email ?? data.profEmail,
          mins_left: diff_mins,
          secs_left: diff_secs,
        };
        // In a real flow, route to the exam page with the payload
        console.log("Exam payload", payload);
        toast.success("Exam is active. Proceed to exam window.");
      } else if (now >= end) {
        setStatus("Exam has already ended");
      } else {
        setStatus("Exam has not started now");
      }
    } catch (e) {
      setStatus("Exam code is invalid");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Welcome, {session.user?.name?.split(" ")[0]}</h2>
        <p className="text-sm text-muted-foreground">Enter the exam code to start the exam.</p>
      </div>

      <Card className="p-4 space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="exam-code">Exam Code</Label>
          <Input id="exam-code" value={examCode} onChange={(e) => setExamCode(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button onClick={startExam} disabled={!examCode}>Start Exam</Button>
        </div>
        {status && <p className="text-sm text-destructive">{status}</p>}
      </Card>
    </div>
  );
}
