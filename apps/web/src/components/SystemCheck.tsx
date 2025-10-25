"use client";
import React, { useEffect, useRef, useState } from "react";

export default function SystemCheck() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [supported, setSupported] = useState<boolean>(false);
  const [online, setOnline] = useState<boolean>(true);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [hasMic, setHasMic] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [streamActive, setStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    setSupported(!!(typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia));

    async function getDevices() {
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        setDevices(list);
        setHasCamera(list.some((d) => d.kind === "videoinput"));
        setHasMic(list.some((d) => d.kind === "audioinput"));
      } catch (err: any) {
        setError(String(err?.message ?? err));
      }
    }

    if (supported) getDevices();

    function handleOnline() {
      setOnline(true);
    }
    function handleOffline() {
      setOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      stopStream();
    };
  }, [supported]);

  async function startCamera() {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(() => {});
      }
      setStreamActive(true);
    } catch (err: any) {
      setError(err?.message ?? String(err));
      setStreamActive(false);
    }
  }

  async function testMic() {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      // we don't attach audio to any element; just stop tracks after quick check
      s.getTracks().forEach((t) => t.stop());
      setHasMic(true);
    } catch (err: any) {
      setHasMic(false);
      setError(err?.message ?? String(err));
    }
  }

  function stopStream() {
    try {
      const s = videoRef.current?.srcObject as MediaStream | null;
      if (s) {
        s.getTracks().forEach((t) => t.stop());
        videoRef.current!.srcObject = null;
      }
    } catch (err) {
      // ignore
    }
    setStreamActive(false);
  }

  async function runAllChecks() {
    setError(null);
    if (!supported) return setError("getUserMedia not supported in this browser");
    try {
      await startCamera();
      await testMic();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    }
  }

  return (
    <section className="rounded-lg bg-slate-900/40 p-6">
      <h3 className="text-lg font-semibold text-white">System Check</h3>
      <p className="mt-2 text-sm text-slate-300">Verify your webcam, microphone, and browser before joining an exam.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="rounded-md border border-slate-700 bg-slate-800 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-slate-200">Browser</span>
              </div>
              <div className="text-sm text-slate-300">{supported ? "Supported" : "Not supported"}</div>
            </div>
            <div className="text-xs text-slate-400">{supported ? "getUserMedia is available." : "Your browser may not support webcam/mic capture."}</div>
          </div>

          <div className="mt-3 rounded-md border border-slate-700 bg-slate-800 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${online ? "bg-emerald-400" : "bg-rose-500"}`} />
                <span className="text-sm text-slate-200">Network</span>
              </div>
              <div className="text-sm text-slate-300">{online ? "Online" : "Offline"}</div>
            </div>
            <div className="text-xs text-slate-400">{online ? "Connection looks good." : "Please check your network connection."}</div>
          </div>

          <div className="mt-3 rounded-md border border-slate-700 bg-slate-800 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${hasCamera ? "bg-emerald-400" : hasCamera === false ? "bg-rose-500" : "bg-amber-400"}`} />
                <span className="text-sm text-slate-200">Camera</span>
              </div>
              <div className="text-sm text-slate-300">{hasCamera === null ? "Unknown" : hasCamera ? "Available" : "Not found"}</div>
            </div>
            <div className="text-xs text-slate-400">{devices.filter((d) => d.kind === "videoinput").map((d) => d.label || "Camera").join(", ") || "No camera detected."}</div>
          </div>

          <div className="mt-3 rounded-md border border-slate-700 bg-slate-800 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${hasMic ? "bg-emerald-400" : hasMic === false ? "bg-rose-500" : "bg-amber-400"}`} />
                <span className="text-sm text-slate-200">Microphone</span>
              </div>
              <div className="text-sm text-slate-300">{hasMic === null ? "Unknown" : hasMic ? "Available" : "Not found"}</div>
            </div>
            <div className="text-xs text-slate-400">{devices.filter((d) => d.kind === "audioinput").map((d) => d.label || "Microphone").join(", ") || "No microphone detected."}</div>
          </div>
        </div>

        <div>
          <div className="rounded-md border border-slate-700 bg-black/20 p-2">
            <video ref={videoRef} className="h-48 w-full rounded-md bg-black object-cover" autoPlay playsInline muted />
          </div>

          <div className="mt-3 flex gap-2">
            <button onClick={runAllChecks} className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">Run System Check</button>
            {streamActive ? (
              <button onClick={stopStream} className="inline-flex items-center rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-600">Stop Camera</button>
            ) : (
              <button onClick={startCamera} className="inline-flex items-center rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-600">Start Camera</button>
            )}
            <button onClick={testMic} className="inline-flex items-center rounded-md border border-slate-700 bg-transparent px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800">Test Mic</button>
          </div>

          {error ? <div className="mt-3 text-sm text-rose-400">{error}</div> : null}
        </div>
      </div>
    </section>
  );
}
