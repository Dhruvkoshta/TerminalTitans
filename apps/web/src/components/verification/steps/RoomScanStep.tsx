"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Camera, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import Webcam from "react-webcam";
import { uploadVideoToVercelBlob } from "@/lib/blob-storage";

interface RoomScanStepProps {
	onNext: () => void;
	onBack: () => void;
	onCapture: (videoDataUrl: string) => void;
}

export default function RoomScanStep({
	onNext,
	onBack,
	onCapture,
}: RoomScanStepProps) {
	const [isCameraReady, setIsCameraReady] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isComplete, setIsComplete] = useState(false);
	const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
	const webcamRef = useRef<Webcam>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<BlobPart[]>([]);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const SCAN_DURATION = 5; // seconds

	const handleUserMedia = useCallback(() => {
		console.log("Room scan camera ready");
		setIsCameraReady(true);
	}, []);

	const handleUserMediaError = useCallback((error: string | DOMException) => {
		console.error("Camera error in room scan:", error);
		const errMsg =
			typeof error === "string" ? error : error.message || "Camera error";
		toast.error("Failed to access camera", { description: errMsg });
	}, []);

	async function uploadBlob(blob: Blob, name: string): Promise<string> {
		return uploadVideoToVercelBlob(blob, name);
	}

	async function startScan() {
		if (!webcamRef.current?.stream) {
			toast.error("Camera not ready");
			return;
		}

		try {
			const stream = webcamRef.current.stream;
			const mediaRecorder = new MediaRecorder(stream, {
				mimeType: "video/webm",
			});

			chunksRef.current = [];

			mediaRecorder.ondataavailable = (e) => {
				if (e.data.size > 0) {
					chunksRef.current.push(e.data);
				}
			};

			mediaRecorder.onstop = async () => {
				const blob = new Blob(chunksRef.current, { type: "video/webm" });
				setRecordedBlob(blob);
				try {
					const url = await uploadBlob(blob, `room-${Date.now()}.webm`);
					onCapture(url);
					toast.success("Room scan uploaded successfully!");
				} catch (err) {
					console.error("Upload error:", err);
					toast.error("Failed to upload room scan");
				}
			};

			mediaRecorderRef.current = mediaRecorder;
			setIsRecording(true);
			setProgress(0);
			mediaRecorder.start();

			// Progress timer
			const startTime = Date.now();
			timerRef.current = setInterval(() => {
				const elapsed = (Date.now() - startTime) / 1000;
				const percentage = (elapsed / SCAN_DURATION) * 100;

				if (elapsed >= SCAN_DURATION) {
					if (timerRef.current) clearInterval(timerRef.current);
					if (mediaRecorderRef.current?.state === "recording") {
						mediaRecorderRef.current.stop();
					}
					setIsRecording(false);
					setIsComplete(true);
					setProgress(100);
					toast.success("Room scan completed!");
				} else {
					setProgress(percentage);
				}
			}, 100);
		} catch (err) {
			console.error("Recording error:", err);
			toast.error("Failed to start recording");
			setIsRecording(false);
		}
	}

	function resetScan() {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		if (
			mediaRecorderRef.current &&
			mediaRecorderRef.current.state === "recording"
		) {
			mediaRecorderRef.current.stop();
		}
		mediaRecorderRef.current = null;
		chunksRef.current = [];
		setIsRecording(false);
		setProgress(0);
		setIsComplete(false);
		setRecordedBlob(null);
	}

	const videoConstraints = {
		width: 1280,
		height: 720,
		facingMode: "user",
	};

	return (
		<div className='space-y-6'>
			<div className='space-y-2'>
				<h2 className='text-2xl font-bold'>Room Scan</h2>
				<p className='text-muted-foreground'>
					Please do a complete 360° scan of your room
				</p>
			</div>

			<Card className='p-6'>
				<div className='space-y-6'>
					<div className='aspect-video bg-card rounded-lg overflow-hidden relative'>
						{isComplete ? (
							<div className='flex items-center justify-center h-full'>
								<div className='text-center'>
									<CheckCircle2 className='h-16 w-16 text-green-500 mx-auto mb-4' />
									<p className='text-lg font-medium text-green-500'>
										Scan Complete!
									</p>
								</div>
							</div>
						) : (
							<>
								<Webcam
									ref={webcamRef}
									audio={false}
									videoConstraints={videoConstraints}
									onUserMedia={handleUserMedia}
									onUserMediaError={handleUserMediaError}
									mirrored={true}
									className='w-full h-full object-cover'
								/>
								{isRecording && (
									<div className='absolute inset-0 flex items-center justify-center bg-black/40'>
										<div className='text-center text-foreground'>
											<Camera className='h-16 w-16 mx-auto mb-4 animate-pulse' />
											<p className='text-lg font-medium'>
												Recording Room Scan...
											</p>
											<p className='text-sm mt-2'>
												Please slowly pan your camera 360°
											</p>
										</div>
									</div>
								)}
							</>
						)}

						{/* Recording progress bar */}
						{(isRecording || isComplete) && (
							<div className='absolute bottom-0 inset-x-0 p-4'>
								<div className='space-y-2'>
									<Progress value={progress} className='h-2' />
									<div className='flex justify-between text-sm text-foreground'>
										<span>{Math.round(progress)}%</span>
										<span>
											{Math.ceil((SCAN_DURATION * (100 - progress)) / 100)}s
											remaining
										</span>
									</div>
								</div>
							</div>
						)}
					</div>

					<div className='flex gap-3 justify-center'>
						{!isRecording && !isComplete && (
							<Button onClick={startScan} disabled={!isCameraReady}>
								<Camera className='w-4 h-4 mr-2' />
								Start Room Scan
							</Button>
						)}

						{isComplete && (
							<>
								<Button variant='outline' onClick={resetScan}>
									<RotateCcw className='w-4 h-4 mr-2' />
									Retake Scan
								</Button>
								<Button onClick={onNext}>
									<CheckCircle2 className='w-4 h-4 mr-2' />
									Continue
								</Button>
							</>
						)}

						{isRecording && (
							<Button variant='destructive' onClick={resetScan}>
								<XCircle className='w-4 h-4 mr-2' />
								Cancel Scan
							</Button>
						)}
					</div>
				</div>
			</Card>

			<div className='flex justify-between'>
				<Button variant='outline' onClick={onBack}>
					Back
				</Button>
			</div>
		</div>
	);
}
