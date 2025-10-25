"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function InstructorDashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const profEmail = session.user?.email || "";

  const [name, setName] = useState("");
  const [examLink, setExamLink] = useState("");
  const [dateTimeStart, setDateTimeStart] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [examCode, setExamCode] = useState("");
  const [errorText, setErrorText] = useState("");

  const [logsExamCode, setLogsExamCode] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  function isUrl(s: string) {
    const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);
  }

  function generateCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const length = 5;
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setExamCode(result);
    navigator.clipboard?.writeText(result).catch(() => {});
    toast.success("Exam code generated and copied");
  }

  async function createExam() {
    setErrorText("");
    if (!name) return setErrorText("Name of Exam cannot be empty");
    if (!examLink) return setErrorText("Exam Link cannot be empty");
    if (!isUrl(examLink)) return setErrorText("Exam Link must be a valid url");
    const durNum = Number(duration);
    if (!durNum) return setErrorText("Duration cannot be 0");
    if (!examCode) return setErrorText("Click Generate to get an exam code first");
    if (!dateTimeStart) return setErrorText("Start date/time is required");

    try {
      const res = await fetch("/api/exams/createExam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          exam_link: examLink,
          date_time_start: new Date(dateTimeStart).toISOString(),
          duration: durNum,
          exam_code: examCode,
          prof_email: profEmail,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.name || data?.message || "Failed to create exam");
        return;
      }
      toast.success("Exam created. Exam code copied to clipboard.");
      navigator.clipboard?.writeText(examCode).catch(() => {});
      // reset form
      setName("");
      setExamLink("");
      setDateTimeStart("");
      setDuration("");
      setExamCode("");
      setErrorText("");
    } catch (e) {
      toast.error("Some error occurred in creating the exam");
    }
  }

  async function loadLogs() {
    setLoadingLogs(true);
    setLogs([]);
    try {
      const res = await fetch("/api/logs/allData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_code: logsExamCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.message || "Failed to load logs");
      } else {
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      toast.error("Error loading logs");
    } finally {
      setLoadingLogs(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Create Exam</h2>
        <p className="text-sm text-muted-foreground">Hello {session.user?.name?.split(" ")[0]}, create a new exam and share the exam code with students.</p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="exam-name">Exam Name</Label>
            <Input id="exam-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-link">Exam Link</Label>
            <Input id="exam-link" value={examLink} onChange={(e) => setExamLink(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-start">Start Date/Time</Label>
            <Input id="exam-start" type="datetime-local" value={dateTimeStart} onChange={(e) => setDateTimeStart(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-duration">Duration (minutes)</Label>
            <Input id="exam-duration" type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="exam-code">Exam Code</Label>
            <div className="flex gap-2">
              <Input id="exam-code" value={examCode} readOnly className="flex-1" />
              <Button type="button" onClick={generateCode}>Generate</Button>
            </div>
          </div>
        </div>
        {errorText ? <p className="text-red-500 text-sm">{errorText}</p> : null}
        <div className="flex gap-2">
          <Button onClick={createExam}>Create Exam</Button>
        </div>
      </Card>

      <div>
        <h3 className="text-xl font-medium">Exam Logs</h3>
        <p className="text-sm text-muted-foreground">View student activity for an exam code.</p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="logs-code">Exam Code</Label>
            <Input id="logs-code" value={logsExamCode} onChange={(e) => setLogsExamCode(e.target.value)} />
          </div>
          <Button onClick={loadLogs} disabled={!logsExamCode || loadingLogs}>{loadingLogs ? "Loading..." : "Load Logs"}</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="py-2 pr-4">Student</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Tab</th>
                <th className="py-2 pr-4">Keys</th>
                <th className="py-2 pr-4">Mobile</th>
                <th className="py-2 pr-4">Objects</th>
                <th className="py-2 pr-4">Face</th>
                <th className="py-2 pr-4">Multi</th>
                <th className="py-2 pr-4">Eyes</th>
                <th className="py-2 pr-4">Focus</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((row) => (
                <tr key={`${row.exam_code ?? row.examCode}-${row.student_email ?? row.studentEmail}`} className="border-b">
                  <td className="py-2 pr-4">{row.student_name ?? row.studentName}</td>
                  <td className="py-2 pr-4">{row.student_email ?? row.studentEmail}</td>
                  <td className="py-2 pr-4">{row.tab_change_count ?? row.tabChangeCount}</td>
                  <td className="py-2 pr-4">{row.key_press_count ?? row.keyPressCount}</td>
                  <td className="py-2 pr-4">{(row.mobile_found ?? row.mobileFound) ? "Yes" : "No"}</td>
                  <td className="py-2 pr-4">{(row.prohibited_object_found ?? row.prohibitedObjectFound) ? "Yes" : "No"}</td>
                  <td className="py-2 pr-4">{(row.face_not_visible ?? row.faceNotVisible) ? "Yes" : "No"}</td>
                  <td className="py-2 pr-4">{(row.multiple_faces_found ?? row.multipleFacesFound) ? "Yes" : "No"}</td>
                  <td className="py-2 pr-4">{(row.eyes_off_screen ?? row.eyesOffScreen) ? "Yes" : "No"}</td>
                  <td className="py-2 pr-4">{row.focus_score ?? row.focusScore} ({row.focus_status ?? row.focusStatus})</td>
                </tr>
              ))}
              {!logs.length && (
                <tr>
                  <td className="py-4 text-muted-foreground" colSpan={10}>No data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
