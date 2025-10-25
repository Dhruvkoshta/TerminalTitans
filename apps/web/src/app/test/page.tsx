"use client";

import React, { Suspense, useEffect, useMemo, useReducer } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import swal from "sweetalert";
import Detection from "@/components/detection/Detection";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type State = {
  student_name: string;
  student_email: string;
  exam_id: string;
  form_link: string;
  minutes: number;
  seconds: number;
  tab_change: number;
  key_press: number;
  full_screen_exit: number;
  mobile_phone_found: boolean;
  prohibited_object_found: boolean;
  face_not_visible: boolean;
  multiple_faces_visible: boolean;
  eyes_off_screen: boolean;
  focus_score: number;
  focus_status: "focused" | "distracted" | "away";
  checkedPrevLogs: boolean;
};

type Action =
  | { type: "tick" }
  | { type: "setPrevLogs"; payload: Partial<State> }
  | { type: "incTab" }
  | { type: "incKey" }
  | { type: "mobile" }
  | { type: "prohibited" }
  | { type: "faceMissing" }
  | { type: "multiFaces" }
  | { type: "eyesOff" }
  | { type: "focusUpdate"; payload: { penaltyPerSecond: number; status: State["focus_status"] } }
  | { type: "init"; payload: Partial<State> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "init":
      return { ...state, ...action.payload };
    case "tick": {
      let { minutes, seconds, focus_score } = state;
      if (seconds > 0) {
        seconds -= 1;
      } else {
        minutes -= 1;
        seconds = 59;
      }
      return { ...state, minutes, seconds, focus_score: Math.max(0, Math.round(focus_score)) };
    }
    case "setPrevLogs":
      return { ...state, ...action.payload, checkedPrevLogs: true };
    case "incTab":
      return { ...state, tab_change: state.tab_change + 1 };
    case "incKey":
      return { ...state, key_press: state.key_press + 1 };
    case "mobile":
      return { ...state, mobile_phone_found: true };
    case "prohibited":
      return { ...state, prohibited_object_found: true };
    case "faceMissing":
      return { ...state, face_not_visible: true };
    case "multiFaces":
      return { ...state, multiple_faces_visible: true };
    case "eyesOff":
      return { ...state, eyes_off_screen: true };
    case "focusUpdate": {
      const next = Math.max(0, state.focus_score - action.payload.penaltyPerSecond);
      return { ...state, focus_score: next, focus_status: action.payload.status };
    }
    default:
      return state;
  }
}

function TestPageInner() {
  const router = useRouter();
  const params = useSearchParams();

  const initial: State = useMemo(
    () => ({
      student_name: params.get("student_name") || "",
      student_email: params.get("student_email") || "",
      exam_id: params.get("exam_code") || "",
      form_link: params.get("exam_link") || "about:blank",
      minutes: parseInt(params.get("mins_left") || "15", 10),
      seconds: parseInt(params.get("secs_left") || "0", 10),
      tab_change: 0,
      key_press: 0,
      full_screen_exit: 0,
      mobile_phone_found: false,
      prohibited_object_found: false,
      face_not_visible: false,
      multiple_faces_visible: false,
      eyes_off_screen: false,
      focus_score: 100,
      focus_status: "focused",
      checkedPrevLogs: false,
    }),
    [params]
  );

  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        dispatch({ type: "incTab" });
        swal("Changed Tab Detected", "Action has been Recorded", "error");
      }
    };
    const blockContext = (e: Event) => e.preventDefault();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey) {
        dispatch({ type: "incKey" });
        swal(
          e.altKey ? "Alt Key Press Detected" : "Ctrl Key Press Detected",
          "Action has been Recorded",
          "error"
        );
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (state.checkedPrevLogs) return;
    const url = `/api/logs/logByEmail?exam_code=${encodeURIComponent(
      state.exam_id
    )}&student_email=${encodeURIComponent(state.student_email)}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        dispatch({
          type: "setPrevLogs",
          payload: {
            key_press: parseInt(data.key_press_count ?? "0", 10) || 0,
            tab_change: parseInt(data.tab_change_count ?? "0", 10) || 0,
            mobile_phone_found: !!data.mobile_found,
            multiple_faces_visible: !!data.multiple_faces_found,
            prohibited_object_found: !!data.prohibited_object_found,
            face_not_visible: !!data.face_not_visible,
            eyes_off_screen: !!data.eyes_off_screen,
            focus_score: data.focus_score !== undefined ? parseFloat(data.focus_score) : 100,
            focus_status: data.focus_status || "focused",
          },
        });
      })
      .catch(() => {});
  }, [state.checkedPrevLogs, state.exam_id, state.student_email]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "tick" });

      if (state.minutes === 1 && state.seconds === 0) {
        swal("Only 1 Minute Left, Please Submit or attendance won’t be marked");
      }
      if (state.minutes <= 0 && state.seconds <= 0) {
        router.replace("/dashboard");
      }

      const payload = {
        exam_code: state.exam_id,
        student_name: state.student_name,
        student_email: state.student_email,
        key_press_count: state.key_press,
        tab_change_count: state.tab_change,
        mobile_found: state.mobile_phone_found,
        face_not_visible: state.face_not_visible,
        prohibited_object_found: state.prohibited_object_found,
        multiple_faces_found: state.multiple_faces_visible,
        eyes_off_screen: state.eyes_off_screen,
        focus_score: Math.max(0, Math.round(state.focus_score)),
        focus_status: state.focus_status,
      };
      fetch("/api/logs/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }, 1000);

    return () => clearInterval(interval);
  }, [router, state]);

  const handleSubmit = () => {
    const payload = {
      exam_code: state.exam_id,
      student_name: state.student_name,
      student_email: state.student_email,
      key_press_count: state.key_press,
      tab_change_count: state.tab_change,
      mobile_found: state.mobile_phone_found,
      face_not_visible: state.face_not_visible,
      prohibited_object_found: state.prohibited_object_found,
      multiple_faces_found: state.multiple_faces_visible,
      eyes_off_screen: state.eyes_off_screen,
      focus_score: Math.max(0, Math.round(state.focus_score)),
      focus_status: state.focus_status,
    };
    fetch("/api/logs/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .catch(() => {})
      .finally(() => {
        swal("Thank you. Logs have been shared with your professor").then(() =>
          router.push("/dashboard")
        );
      });
  };

  return (
    <div className="grid grid-cols-2 gap-4 h-[calc(100svh-56px)] p-3">
      <div className="flex flex-col gap-3">
        <div className="flex-1 min-h-0 rounded border flex items-center justify-center relative">
          <Detection
            MobilePhone={() => dispatch({ type: "mobile" })}
            ProhibitedObject={() => dispatch({ type: "prohibited" })}
            FaceNotVisible={() => dispatch({ type: "faceMissing" })}
            MultipleFacesVisible={() => dispatch({ type: "multiFaces" })}
            EyesOffScreen={() => dispatch({ type: "eyesOff" })}
            onFocusUpdate={({ penaltyPerSecond, status }) =>
              dispatch({ type: "focusUpdate", payload: { penaltyPerSecond, status } })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded border p-3">
            <p className="text-sm">Name:</p>
            <p className="text-lg font-semibold">{state.student_name || "-"}</p>
            <p className="text-sm mt-2">Exam ID:</p>
            <p className="text-lg font-semibold">{state.exam_id || "-"}</p>
          </div>

          <div className="rounded border p-3 text-center">
            <p className="text-sm">Timer</p>
            <p className="text-5xl font-bold">
              {state.minutes}:{state.seconds < 10 ? `0${state.seconds}` : state.seconds}
            </p>
            <p className="mt-2">
              Focus Score: <strong>{Math.max(0, Math.round(state.focus_score))}</strong> / 100
              &nbsp;|&nbsp; Status: <strong>{state.focus_status}</strong>
            </p>
          </div>
        </div>

        <div className="rounded border p-3 text-center">
          <p>
            To save your attendance, click <strong>Exit Exam</strong> after submitting the exam.
          </p>
          <div className="mt-3">
            <Button onClick={handleSubmit}>Exit Exam</Button>
          </div>
        </div>
      </div>

      <div className="rounded border overflow-hidden">
        <iframe
          src={state.form_link}
          title="exam-form"
          className="w-full h-full"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={<div />}> 
      <div className="px-6 py-4">
        <Card className="rounded-2xl">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Exam Interface</CardTitle>
              <CardDescription className="text-muted-foreground">
                Proctoring session in progress — follow the instructions and keep your camera on.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.replace('/dashboard')}>Exit</Button>
            </div>
          </CardHeader>

          <CardContent>
            <TestPageInner />
          </CardContent>

          <CardFooter>
            <p className="text-sm text-muted-foreground">Your activity will be monitored during this exam.</p>
          </CardFooter>
        </Card>
      </div>
    </Suspense>
  );
}
