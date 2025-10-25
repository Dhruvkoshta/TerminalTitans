"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import swal from "sweetalert";

type DetectionProps = {
  MobilePhone: () => void;
  ProhibitedObject: () => void;
  FaceNotVisible: () => void;
  MultipleFacesVisible: () => void;
  EyesOffScreen: () => void;
  onFocusUpdate?: (info: {
    penaltyPerSecond: number;
    lookingOnScreen: boolean;
    headMove: number;
    status: "focused" | "distracted" | "away";
  }) => void;
};

export default function Detection(props: DetectionProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  // TF modules loaded on demand (avoid SSR issues)
  const tfRef = useRef<any>(null);
  const cocoRef = useRef<any>(null);
  const faceRef = useRef<any>(null);
  const faceDetectorRef = useRef<any>(null);

  // gaze / head-movement memory
  const prevEyeCenter = useRef<{ x: number; y: number } | null>(null);
  const prevInterOcDist = useRef<number | null>(null);
  const eyeMiss = useRef(0);
  const eyeAlerted = useRef(false);

  // detection animation frame / intervals
  const rafId = useRef<number | null>(null);
  const faceInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // draw predictions overlay
  const drawPredictions = useCallback((preds: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "16px sans-serif";
    ctx.textBaseline = "top";

    preds.forEach((p) => {
      const [x, y, w, h] = p.bbox;
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(p.class).width;
      const textHeight = 16;
      ctx.fillRect(x, y, textWidth, textHeight);
    });

    preds.forEach((p) => {
      const [x, y] = p.bbox;
      if (["person", "cell phone", "book", "laptop"].includes(p.class)) {
        ctx.fillStyle = "#000";
        ctx.fillText(p.class, x, y);
      }
    });
  }, []);

  // compute gaze + head movement using face landmarks
  const runGaze = useCallback(async () => {
    const detector = faceDetectorRef.current;
    const video = webcamRef.current?.video as HTMLVideoElement | undefined;
    if (!detector || !video || video.readyState !== 4) return;
    try {
      const faces = await detector.estimateFaces(video, { flipHorizontal: true });
      if (!faces || faces.length === 0) {
        props.onFocusUpdate?.({
          penaltyPerSecond: 2,
          lookingOnScreen: false,
          headMove: 0,
          status: "away",
        });
        return;
      }
      const face = faces[0];
      const kps = face.keypoints || [];
      const get = (name: string) => kps.find((p: any) => p.name === name);

      // derive head movement metric based on normalized eye center drift
      const leftIris = get("leftEyeIrisCenter");
      const rightIris = get("rightEyeIrisCenter");
      const leftInner = get("leftEyeInnerCorner");
      const rightOuter = get("rightEyeOuterCorner");
      let headMove = 0;
      if (leftIris && rightIris && leftInner && rightOuter) {
        const cx = (leftIris.x + rightIris.x) / 2;
        const cy = (leftIris.y + rightIris.y) / 2;
        const inter = Math.hypot(rightOuter.x - leftInner.x, rightOuter.y - leftInner.y);
        if (prevEyeCenter.current && prevInterOcDist.current) {
          const dx = (cx - prevEyeCenter.current.x) / (prevInterOcDist.current || 1);
          const dy = (cy - prevEyeCenter.current.y) / (prevInterOcDist.current || 1);
          headMove = Math.hypot(dx, dy);
        }
        prevEyeCenter.current = { x: cx, y: cy };
        prevInterOcDist.current = inter > 1 ? inter : 1;
      }

      const eyeGazeOk = (side: "left" | "right") => {
        const iris = get(`${side}EyeIrisCenter`);
        const inner = get(`${side}EyeInnerCorner`);
        const outer = get(`${side}EyeOuterCorner`);
        const upper = get(`${side}EyeUpper0`);
        const lower = get(`${side}EyeLower0`);
        if (!iris || !inner || !outer || !upper || !lower) return false;
        const dx = outer.x - inner.x;
        const dy = lower.y - upper.y;
        if (Math.abs(dx) < 1 || Math.abs(dy) < 1) return false;
        const rx = (iris.x - inner.x) / dx;
        const ry = (iris.y - upper.y) / dy;
        const H_MIN = 0.35,
          H_MAX = 0.75,
          V_MIN = 0.35,
          V_MAX = 0.75;
        return rx >= H_MIN && rx <= H_MAX && ry >= V_MIN && ry <= V_MAX;
      };

      const leftOk = eyeGazeOk("left");
      const rightOk = eyeGazeOk("right");
      const lookingOnScreen = leftOk && rightOk;

      let penalty = 0;
      if (lookingOnScreen) {
        eyeMiss.current = 0;
        eyeAlerted.current = false;
      } else {
        eyeMiss.current += 1;
        if (eyeMiss.current >= 2 && !eyeAlerted.current) {
          eyeAlerted.current = true;
          penalty += 2;
          swal("Eyes Looking Away Detected", "Action has been Recorded", "error");
          props.EyesOffScreen();
        }
      }

      let status: "focused" | "distracted" | "away" = "focused";
      if (!lookingOnScreen) status = "distracted";
      if (headMove > 0.12) status = "away";

      props.onFocusUpdate?.({
        penaltyPerSecond: penalty,
        lookingOnScreen,
        headMove,
        status,
      });
    } catch {
      // ignore transient inference errors
    }
  }, [props]);

  // object detection loop with coco-ssd
  const runObjects = useCallback(async () => {
    const video = webcamRef.current?.video as HTMLVideoElement | undefined;
    if (!video || video.readyState !== 4) {
      rafId.current = requestAnimationFrame(runObjects);
      return;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    try {
      const model = cocoRef.current as any;
      if (!model) {
        rafId.current = requestAnimationFrame(runObjects);
        return;
      }
      const preds = await model.detect(video);
      drawPredictions(preds);

      let faces = 0;
      for (const p of preds) {
        if (p.class === "cell phone") {
          props.MobilePhone();
          swal("Cell Phone Detected", "Action has been Recorded", "error");
        } else if (p.class === "book" || p.class === "laptop") {
          props.ProhibitedObject();
          swal("Prohibited Object Detected", "Action has been Recorded", "error");
        } else if (p.class === "person") {
          faces += 1;
        }
      }
      if (faces > 1) {
        props.MultipleFacesVisible();
        swal(`${faces} people detected`, "Action has been Recorded", "error");
      }
    } catch {
      // noop
    }
    rafId.current = requestAnimationFrame(runObjects);
  }, [drawPredictions, props]);

  // load TF + models and start loops
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      const tf = await import("@tensorflow/tfjs");
      tfRef.current = tf;

      const coco = await import("@tensorflow-models/coco-ssd");
      cocoRef.current = await coco.load();

      const fld = await import("@tensorflow-models/face-landmarks-detection");
      faceRef.current = fld;

      // Try to create the detector using MediaPipe runtime first. If that fails
      // (CDN blocked, CSP, or environment issue), fall back to the tfjs runtime.
      try {
        faceDetectorRef.current = await fld.createDetector(
          fld.SupportedModels.MediaPipeFaceMesh,
          {
            runtime: "mediapipe",
            refineLandmarks: true,
            solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
          }
        );
      } catch (mediapipeErr) {
        // log the original error for debugging
        // Try tfjs runtime as a fallback
        try {
          console.warn("MediaPipe detector failed, trying tfjs runtime:", mediapipeErr);
          faceDetectorRef.current = await fld.createDetector(
            fld.SupportedModels.MediaPipeFaceMesh,
            {
              runtime: "tfjs",
              refineLandmarks: true,
            }
          );
        } catch (tfjsErr) {
          // If both fail, rethrow to be caught by outer handler
          console.error("Both MediaPipe and tfjs detector creation failed:", mediapipeErr, tfjsErr);
          throw tfjsErr || mediapipeErr;
        }
      }

      if (!cancelled) setReady(true);
    }

    loadAll().catch((err: any) => {
      // helpful console output + user-facing alert
      console.error("Failed to load ML models:", err);
      swal("Failed to load ML models", (err && err.message) || "Please refresh, allow camera access, and check network/CSP.", "error");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // start detection loops once webcam + models are ready
  useEffect(() => {
    if (!ready) return;
    rafId.current = requestAnimationFrame(runObjects);
    faceInterval.current = setInterval(runGaze, 1000);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (faceInterval.current) clearInterval(faceInterval.current);
    };
  }, [ready, runObjects, runGaze]);

  // periodic face-not-visible check using face landmarks
  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(async () => {
      const detector = faceDetectorRef.current;
      const video = webcamRef.current?.video as HTMLVideoElement | undefined;
      if (!detector || !video || video.readyState !== 4) return;
      try {
        const faces = await detector.estimateFaces(video, { flipHorizontal: true });
        if (!faces || faces.length === 0) {
          props.FaceNotVisible();
          swal("Face Not Visible", "Action has been Recorded", "error");
        }
      } catch {}
    }, 5000);
    return () => clearInterval(timer);
  }, [ready, props]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <Webcam
        ref={webcamRef}
        mirrored
        audio={false}
        videoConstraints={{ facingMode: "user", width: 800, height: 400 }}
        style={{ position: "absolute", width: 800, height: 400, objectFit: "cover" }}
      />
      <canvas ref={canvasRef} className="absolute" width={800} height={400} style={{ width: 800, height: 400 }} />
    </div>
  );
}
