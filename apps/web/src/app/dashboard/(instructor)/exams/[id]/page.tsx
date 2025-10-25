"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ExamDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const id = params?.id;
  const profEmail = search?.get("prof_email") || undefined;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exam, setExam] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        // fetch exam by id via list + filter (no id endpoint yet)
        const resAll = await fetch(`/api/exams/examsByProf?prof_email=${encodeURIComponent(profEmail || "")}`);
        const dataAll = await resAll.json();
        const found = Array.isArray(dataAll) ? dataAll.find((x) => String(x.id) === String(id)) : null;
        if (!found) throw new Error("Exam not found or access denied");
        setExam(found);
        if (found.examCode) {
          const resLogs = await fetch("/api/logs/allData", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exam_code: found.examCode }),
          });
          const dataLogs = await resLogs.json();
          setLogs(Array.isArray(dataLogs) ? dataLogs : []);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load exam");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id, profEmail]);

  const flagsSummary = useMemo(() => {
    const sum = {
      mobileFound: 0,
      prohibitedObjectFound: 0,
      faceNotVisible: 0,
      multipleFacesFound: 0,
      eyesOffScreen: 0,
    } as Record<string, number>;
    for (const r of logs) {
      if (r.mobile_found ?? r.mobileFound) sum.mobileFound++;
      if (r.prohibited_object_found ?? r.prohibitedObjectFound) sum.prohibitedObjectFound++;
      if (r.face_not_visible ?? r.faceNotVisible) sum.faceNotVisible++;
      if (r.multiple_faces_found ?? r.multipleFacesFound) sum.multipleFacesFound++;
      if (r.eyes_off_screen ?? r.eyesOffScreen) sum.eyesOffScreen++;
    }
    return sum;
  }, [logs]);

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Exam Details</h1>
          {exam && (
            <p className="text-sm text-muted-foreground">
              {exam.name} • Code: <span className="font-mono">{exam.examCode}</span>
            </p>
          )}
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
          {exam?.examCode && (
            <a className="underline" href={`/exam/${exam.examCode}`} target="_blank" rel="noreferrer">Open Exam</a>
          )}
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {exam && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 space-y-2 border rounded-md p-3">
            <div className="text-sm">Start: {new Date(exam.dateTimeStart).toLocaleString?.() ?? String(exam.dateTimeStart)}</div>
            <div className="text-sm">Duration: {exam.duration} min</div>
            <div className="text-sm">Status: {exam.status}</div>
            <div className="text-sm">Link: <span className="break-all">{exam.examLink}</span></div>
          </div>

          <div className="col-span-2 space-y-3">
            <div className="border rounded-md p-3">
              <h3 className="font-medium mb-2">Flags Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="p-2 rounded border">Mobile: {flagsSummary.mobileFound}</div>
                <div className="p-2 rounded border">Objects: {flagsSummary.prohibitedObjectFound}</div>
                <div className="p-2 rounded border">Face not visible: {flagsSummary.faceNotVisible}</div>
                <div className="p-2 rounded border">Multiple faces: {flagsSummary.multipleFacesFound}</div>
                <div className="p-2 rounded border">Eyes off: {flagsSummary.eyesOffScreen}</div>
              </div>
            </div>

            <div className="border rounded-md p-3">
              <h3 className="font-medium mb-2">Focus Score Distribution</h3>
              <div className="space-y-1">
                {(() => {
                  const buckets = [0,10,20,30,40,50,60,70,80,90,100];
                  const counts = buckets.map((_b, i) => 0);
                  for (const r of logs) {
                    const score = Number(r.focus_score ?? r.focusScore ?? 0);
                    const idx = Math.min(10, Math.max(0, Math.floor(score/10)));
                    counts[idx]++;
                  }
                  const max = Math.max(1, ...counts);
                  return buckets.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-14 text-right">{b.toString().padStart(2,"0")}{i<10?"-"+(b+9):""}</div>
                      <div className="h-3 bg-slate-200 rounded relative flex-1">
                        <div className="h-3 bg-slate-800 rounded" style={{ width: `${(counts[i]/max)*100}%` }} />
                      </div>
                      <div className="w-8 text-right">{counts[i]}</div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="border rounded-md p-3 overflow-x-auto">
              <h3 className="font-medium mb-2">Recent Activity</h3>
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
                    <th className="py-2 pr-4">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 pr-4">{row.student_name ?? row.studentName}</td>
                      <td className="py-2 pr-4">{row.student_email ?? row.studentEmail}</td>
                      <td className="py-2 pr-4">{row.tab_change_count ?? row.tabChangeCount}</td>
                      <td className="py-2 pr-4">{row.key_press_count ?? row.keyPressCount}</td>
                      <td className="py-2 pr-4">{(row.mobile_found ?? row.mobileFound) ? "Yes" : "No"}</td>
                      <td className="py-2 pr-4">{(row.prohibited_object_found ?? row.prohibitedObjectFound) ? "Yes" : "No"}</td>
                      <td className="py-2 pr-4">{(row.face_not_visible ?? row.faceNotVisible) ? "Yes" : "No"}</td>
                      <td className="py-2 pr-4">{(row.multiple_faces_found ?? row.multipleFacesFound) ? "Yes" : "No"}</td>
                      <td className="py-2 pr-4">{(row.eyes_off_screen ?? row.eyesOffScreen) ? "Yes" : "No"}</td>
                      <td className="py-2 pr-4">{(row.focus_score ?? row.focusScore)} ({row.focus_status ?? row.focusStatus})</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{row.created_at ? new Date(row.created_at).toLocaleString() : (row.createdAt ? new Date(row.createdAt).toLocaleString() : "")}</td>
                    </tr>
                  ))}
                  {!logs.length && (
                    <tr>
                      <td className="py-4 text-muted-foreground" colSpan={11}>No logs</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
