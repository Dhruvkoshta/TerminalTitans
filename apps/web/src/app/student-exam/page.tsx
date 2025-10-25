"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import Detection from "@/components/detection/Detection";

function StudentExamPageContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: session } = authClient.useSession();

	const examCode = searchParams?.get("exam_code") || "";
	const minsLeft = parseInt(searchParams?.get("mins_left") || "15", 10);
	const secsLeft = parseInt(searchParams?.get("secs_left") || "0", 10);
	const examLink = searchParams?.get("exam_link") || "";

	const [timeRemaining, setTimeRemaining] = useState(minsLeft * 60 + secsLeft);
	const [tabChangeCount, setTabChangeCount] = useState(0);
	const [keyPressCount, setKeyPressCount] = useState(0);
	const [fullScreenExitCount, setFullScreenExitCount] = useState(0);
	const [proctorLog, setProctorLog] = useState<{
		mobileFound: boolean;
		prohibitedObjectFound: boolean;
		faceNotVisible: boolean;
		multipleFacesFound: boolean;
		eyesOffScreen: boolean;
		focusScore: number;
		focusStatus: "focused" | "distracted" | "away";
	}>({
		mobileFound: false,
		prohibitedObjectFound: false,
		faceNotVisible: false,
		multipleFacesFound: false,
		eyesOffScreen: false,
		focusScore: 100,
		focusStatus: "focused",
	});
	const [checkedPrevLogs, setCheckedPrevLogs] = useState(false);

	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const logIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// Toast throttling (5 second cooldown per violation type)
	const lastToastTimeRef = useRef<{ [key: string]: number }>({});
	const TOAST_COOLDOWN = 5000; // 5 seconds

	const showToast = useCallback(
		(key: string, title: string, description?: string) => {
			const now = Date.now();
			if (
				!lastToastTimeRef.current[key] ||
				now - lastToastTimeRef.current[key] >= TOAST_COOLDOWN
			) {
				lastToastTimeRef.current[key] = now;
				toast.error(title, { description });
			}
		},
		[]
	);

	const studentName = session?.user?.name || "";
	const studentEmail = session?.user?.email || "";

	// Load previous logs on mount
	useEffect(() => {
		if (checkedPrevLogs || !examCode || !studentEmail) return;

		const url = `/api/logs/logByEmail?exam_code=${encodeURIComponent(
			examCode
		)}&student_email=${encodeURIComponent(studentEmail)}`;

		fetch(url)
			.then((r) => r.json())
			.then((data) => {
				setKeyPressCount(parseInt(data.key_press_count ?? "0", 10) || 0);
				setTabChangeCount(parseInt(data.tab_change_count ?? "0", 10) || 0);
				setProctorLog((prev) => ({
					...prev,
					mobileFound: !!data.mobile_found,
					multipleFacesFound: !!data.multiple_faces_found,
					prohibitedObjectFound: !!data.prohibited_object_found,
					faceNotVisible: !!data.face_not_visible,
					eyesOffScreen: !!data.eyes_off_screen,
					focusScore:
						data.focus_score !== undefined ? parseFloat(data.focus_score) : 100,
					focusStatus: data.focus_status || "focused",
				}));
				setCheckedPrevLogs(true);
			})
			.catch(() => setCheckedPrevLogs(true));
	}, [checkedPrevLogs, examCode, studentEmail]);

	// Initialize webcam
	useEffect(() => {
		async function initWebcam() {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: { width: 640, height: 480 },
					audio: false,
				});
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					streamRef.current = stream;
				}
			} catch (err) {
				console.error("Failed to access webcam:", err);
				toast.error("Webcam access is required for this exam");
			}
		}
		initWebcam();

		return () => {
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((track) => track.stop());
			}
		};
	}, []);

	// Timer countdown with log updates every second
	useEffect(() => {
		if (timeRemaining <= 0) {
			handleSubmitExam();
			return;
		}

		const timer = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});

			// Warning at 1 minute
			const mins = Math.floor(timeRemaining / 60);
			const secs = timeRemaining % 60;
			if (mins === 1 && secs === 0) {
				toast.warning("Only 1 Minute Left", {
					description: "Please Submit or attendance won't be marked",
				});
			}

			// Send logs every second
			if (examCode && studentEmail) {
				const payload = {
					exam_code: examCode,
					student_name: studentName,
					student_email: studentEmail,
					key_press_count: keyPressCount,
					tab_change_count: tabChangeCount,
					mobile_found: proctorLog.mobileFound,
					face_not_visible: proctorLog.faceNotVisible,
					prohibited_object_found: proctorLog.prohibitedObjectFound,
					multiple_faces_found: proctorLog.multipleFacesFound,
					eyes_off_screen: proctorLog.eyesOffScreen,
					focus_score: Math.max(0, Math.round(proctorLog.focusScore)),
					focus_status: proctorLog.focusStatus,
				};
				fetch("/api/logs/update", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				}).catch(() => {});
			}
		}, 1000);

		return () => clearInterval(timer);
	}, [
		timeRemaining,
		examCode,
		studentEmail,
		studentName,
		keyPressCount,
		tabChangeCount,
		proctorLog,
	]);

	// Tab change detection with alert
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.hidden) {
				setTabChangeCount((prev) => prev + 1);
				showToast(
					"tabChange",
					"Changed Tab Detected",
					"Action has been Recorded"
				);
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () =>
			document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, [showToast]);

	// Block right-click context menu
	useEffect(() => {
		const blockContext = (e: Event) => e.preventDefault();
		document.addEventListener("contextmenu", blockContext);
		return () => document.removeEventListener("contextmenu", blockContext);
	}, []);

	// Key press tracking with alerts for Alt/Ctrl
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			setKeyPressCount((prev) => prev + 1);

			if (e.altKey || e.ctrlKey) {
				showToast(
					e.altKey ? "altKeyPress" : "ctrlKeyPress",
					e.altKey ? "Alt Key Press Detected" : "Ctrl Key Press Detected",
					"Action has been Recorded"
				);
			}
		};

		document.addEventListener("keydown", handleKeyPress);
		return () => document.removeEventListener("keydown", handleKeyPress);
	}, [showToast]);

	// Send logs continuously every 10 seconds (backup to the per-second updates)
	const sendLogData = useCallback(async () => {
		if (!examCode || !studentEmail) return;

		try {
			await fetch("/api/logs/stream", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					exam_code: examCode,
					student_name: studentName,
					student_email: studentEmail,
					tab_change_count: tabChangeCount,
					key_press_count: keyPressCount,
					mobile_found: proctorLog.mobileFound,
					face_not_visible: proctorLog.faceNotVisible,
					prohibited_object_found: proctorLog.prohibitedObjectFound,
					multiple_faces_found: proctorLog.multipleFacesFound,
					eyes_off_screen: proctorLog.eyesOffScreen,
					focus_score: Math.max(0, Math.round(proctorLog.focusScore)),
					focus_status: proctorLog.focusStatus,
				}),
			});
		} catch (err) {
			console.error("Failed to send log data:", err);
		}
	}, [
		examCode,
		studentName,
		studentEmail,
		tabChangeCount,
		keyPressCount,
		proctorLog,
	]);

	useEffect(() => {
		// Send logs every 10 seconds as backup
		logIntervalRef.current = setInterval(() => {
			sendLogData();
		}, 10000);

		return () => {
			if (logIntervalRef.current) {
				clearInterval(logIntervalRef.current);
			}
		};
	}, [sendLogData]);

	// Detection callbacks
	const handleMobilePhone = useCallback(() => {
		setProctorLog((prev) => ({ ...prev, mobileFound: true }));
	}, []);

	const handleProhibitedObject = useCallback(() => {
		setProctorLog((prev) => ({ ...prev, prohibitedObjectFound: true }));
	}, []);

	const handleFaceNotVisible = useCallback(() => {
		setProctorLog((prev) => ({ ...prev, faceNotVisible: true }));
	}, []);

	const handleMultipleFaces = useCallback(() => {
		setProctorLog((prev) => ({ ...prev, multipleFacesFound: true }));
	}, []);

	const handleEyesOffScreen = useCallback(() => {
		setProctorLog((prev) => ({ ...prev, eyesOffScreen: true }));
	}, []);

	const handleFocusUpdate = useCallback(
		({
			penaltyPerSecond,
			status,
		}: {
			penaltyPerSecond: number;
			status: "focused" | "distracted" | "away";
		}) => {
			setProctorLog((prev) => ({
				...prev,
				focusScore: Math.max(0, prev.focusScore - penaltyPerSecond),
				focusStatus: status,
			}));
		},
		[]
	);

	function handleSubmitExam() {
		const payload = {
			exam_code: examCode,
			student_name: studentName,
			student_email: studentEmail,
			key_press_count: keyPressCount,
			tab_change_count: tabChangeCount,
			mobile_found: proctorLog.mobileFound,
			face_not_visible: proctorLog.faceNotVisible,
			prohibited_object_found: proctorLog.prohibitedObjectFound,
			multiple_faces_found: proctorLog.multipleFacesFound,
			eyes_off_screen: proctorLog.eyesOffScreen,
			focus_score: Math.max(0, Math.round(proctorLog.focusScore)),
			focus_status: proctorLog.focusStatus,
		};

		fetch("/api/logs/update", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		})
			.catch(() => {})
			.finally(() => {
				toast.success("Thank you. Logs have been shared with your professor");
				setTimeout(() => router.push("/dashboard"), 2000);
			});
	}

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
	};

	return (
		<div className='min-h-screen bg-slate-900 text-white p-4'>
			<div className='max-w-7xl mx-auto'>
				{/* Header */}
				<div className='bg-slate-800 rounded-lg p-4 mb-4 flex items-center justify-between'>
					<div>
						<h1 className='text-xl font-bold'>Exam in Progress</h1>
						<p className='text-sm text-slate-400'>
							Code: {examCode} | Student: {studentName || studentEmail}
						</p>
					</div>
					<div className='flex items-center gap-6'>
						<div className='text-center'>
							<div className='text-2xl font-mono font-bold text-green-400'>
								{formatTime(timeRemaining)}
							</div>
							<div className='text-xs text-slate-400'>Time Remaining</div>
						</div>
						<div className='text-center'>
							<div className='text-2xl font-bold'>
								{Math.max(0, Math.round(proctorLog.focusScore))}
							</div>
							<div className='text-xs text-slate-400'>Focus Score</div>
						</div>
						<Button onClick={handleSubmitExam} variant='destructive'>
							Exit Exam
						</Button>
					</div>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>
					{/* Main exam area */}
					<div className='lg:col-span-3'>
						<Card className='bg-slate-800 border-slate-700 p-6'>
							{examLink ? (
								<iframe
									src={examLink}
									className='w-full h-[calc(100vh-200px)] border-0 rounded'
									title='Exam Content'
									sandbox='allow-same-origin allow-scripts allow-forms'
									referrerPolicy='no-referrer'
								/>
							) : (
								<div className='h-[calc(100vh-200px)] flex items-center justify-center text-slate-400'>
									<div className='text-center'>
										<p className='text-xl mb-2'>No exam link provided</p>
										<p className='text-sm'>Please contact your instructor</p>
									</div>
								</div>
							)}
						</Card>
					</div>

					{/* Proctoring sidebar */}
					<div className='space-y-4'>
						{/* Webcam feed with Detection component */}
						<Card className='bg-slate-800 border-slate-700 p-4'>
							<h3 className='text-sm font-medium mb-2'>Live Monitoring</h3>
							<div className='relative aspect-video bg-slate-900 rounded overflow-hidden'>
								<Detection
									MobilePhone={handleMobilePhone}
									ProhibitedObject={handleProhibitedObject}
									FaceNotVisible={handleFaceNotVisible}
									MultipleFacesVisible={handleMultipleFaces}
									EyesOffScreen={handleEyesOffScreen}
									onFocusUpdate={handleFocusUpdate}
								/>
								<div className='absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse z-10' />
							</div>
							<canvas ref={canvasRef} className='hidden' />
						</Card>

						{/* Proctoring stats */}
						<Card className='bg-slate-800 border-slate-700 p-4'>
							<h3 className='text-sm font-medium mb-3'>Activity Monitor</h3>
							<div className='space-y-2 text-sm'>
								<div className='flex justify-between'>
									<span className='text-slate-400'>Tab Switches:</span>
									<span
										className={
											tabChangeCount > 0 ? "text-red-400" : "text-green-400"
										}
									>
										{tabChangeCount}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-slate-400'>Key Presses:</span>
									<span>{keyPressCount}</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-slate-400'>Focus Score:</span>
									<span
										className={
											proctorLog.focusScore < 70
												? "text-red-400"
												: "text-green-400"
										}
									>
										{Math.max(0, Math.round(proctorLog.focusScore))}%
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-slate-400'>Status:</span>
									<span
										className={
											proctorLog.focusStatus === "focused"
												? "text-green-400"
												: proctorLog.focusStatus === "distracted"
												? "text-yellow-400"
												: "text-red-400"
										}
									>
										{proctorLog.focusStatus}
									</span>
								</div>
							</div>
						</Card>

						{/* Warnings */}
						<Card className='bg-slate-800 border-slate-700 p-4'>
							<h3 className='text-sm font-medium mb-3 text-yellow-400'>
								Warnings
							</h3>
							<div className='space-y-2 text-xs'>
								{proctorLog.faceNotVisible && (
									<div className='flex items-center gap-2 text-yellow-400'>
										<div className='w-2 h-2 bg-yellow-400 rounded-full' />
										Face not clearly visible
									</div>
								)}
								{proctorLog.eyesOffScreen && (
									<div className='flex items-center gap-2 text-yellow-400'>
										<div className='w-2 h-2 bg-yellow-400 rounded-full' />
										Looking away detected
									</div>
								)}
								{proctorLog.multipleFacesFound && (
									<div className='flex items-center gap-2 text-red-400'>
										<div className='w-2 h-2 bg-red-400 rounded-full' />
										Multiple faces detected
									</div>
								)}
								{proctorLog.mobileFound && (
									<div className='flex items-center gap-2 text-red-400'>
										<div className='w-2 h-2 bg-red-400 rounded-full' />
										Mobile device detected
									</div>
								)}
								{proctorLog.prohibitedObjectFound && (
									<div className='flex items-center gap-2 text-red-400'>
										<div className='w-2 h-2 bg-red-400 rounded-full' />
										Prohibited object found
									</div>
								)}
								{!proctorLog.faceNotVisible &&
									!proctorLog.eyesOffScreen &&
									!proctorLog.multipleFacesFound &&
									!proctorLog.mobileFound &&
									!proctorLog.prohibitedObjectFound && (
										<div className='text-green-400 text-center py-2'>
											All checks passed ✓
										</div>
									)}
							</div>
						</Card>

						{/* Instructions */}
						<Card className='bg-slate-800 border-slate-700 p-4'>
							<h3 className='text-sm font-medium mb-2'>Important</h3>
							<ul className='text-xs text-slate-400 space-y-1 list-disc list-inside'>
								<li>Stay visible in camera</li>
								<li>Don't switch tabs</li>
								<li>No external devices</li>
								<li>Keep eyes on screen</li>
								<li>No Alt/Ctrl key shortcuts</li>
							</ul>
							<p className='text-xs text-slate-300 mt-3'>
								To save your attendance, click <strong>Exit Exam</strong> after
								submitting the exam.
							</p>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function StudentExamPage() {
	return (
		<Suspense
			fallback={
				<div className='min-h-screen bg-slate-900 flex items-center justify-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white'></div>
				</div>
			}
		>
			<StudentExamPageContent />
		</Suspense>
	);
}
