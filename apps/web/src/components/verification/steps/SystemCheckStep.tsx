"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, Mic, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface SystemCheckStepProps {
	onNext: () => void;
	onBack: () => void;
}

export default function SystemCheckStep({
	onNext,
	onBack,
}: SystemCheckStepProps) {
	const [cameraStatus, setCameraStatus] = useState<
		"pending" | "success" | "error"
	>("pending");
	const [micStatus, setMicStatus] = useState<"pending" | "success" | "error">(
		"pending"
	);
	const [isChecking, setIsChecking] = useState(false);
	const [errorDetails, setErrorDetails] = useState<string>("");
	const videoRef = useRef<HTMLVideoElement>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationFrameRef = useRef<number | null>(null);
	const streamRef = useRef<MediaStream | null>(null);

	useEffect(() => {
		// Check if we're on HTTPS in production
		const isSecure =
			window.location.protocol === "https:" ||
			window.location.hostname === "localhost";
		if (!isSecure) {
			console.warn("Camera access requires HTTPS in production");
			setErrorDetails("Camera access requires HTTPS");
		}

		checkDevices();
		return () => {
			stopDevices();
		};
	}, []);

	async function checkDevices() {
		setIsChecking(true);
		setErrorDetails("");

		try {
			// Check if mediaDevices is available
			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				throw new Error("getUserMedia is not supported in this browser");
			}

			console.log("Requesting camera and microphone access...");

			// Try with ideal constraints first, fall back to basic if needed
			let stream: MediaStream;
			try {
				stream = await navigator.mediaDevices.getUserMedia({
					video: {
						width: { ideal: 1280 },
						height: { ideal: 720 },
						facingMode: "user",
					},
					audio: true,
				});
			} catch (idealErr) {
				console.warn(
					"Ideal constraints failed, trying basic constraints:",
					idealErr
				);
				// Fallback to basic constraints
				stream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true,
				});
			}

			console.log("Camera access granted:", stream.getTracks());
			streamRef.current = stream;

			// Setup video
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				// Wait for video to be ready
				await new Promise<void>((resolve, reject) => {
					if (!videoRef.current) {
						reject(new Error("Video ref lost"));
						return;
					}
					videoRef.current.onloadedmetadata = () => {
						videoRef.current?.play().then(resolve).catch(reject);
					};
					videoRef.current.onerror = () => {
						reject(new Error("Video element error"));
					};
					// Timeout after 5 seconds
					setTimeout(() => reject(new Error("Video load timeout")), 5000);
				});

				setCameraStatus("success");
				console.log("Camera setup successful");
			}

			// Setup audio visualizer
			const audioContext = new (window.AudioContext ||
				(window as any).webkitAudioContext)();
			const analyser = audioContext.createAnalyser();
			const source = audioContext.createMediaStreamSource(stream);
			source.connect(analyser);
			analyser.fftSize = 256;
			audioContextRef.current = audioContext;
			analyserRef.current = analyser;
			setMicStatus("success");
			console.log("Microphone setup successful");

			// Start audio visualization
			visualizeAudio();
		} catch (err) {
			console.error("Device check error:", err);

			let errorMessage = "Error accessing devices";
			let errorDetail = "";

			if (err instanceof Error) {
				errorDetail = err.message;

				switch (err.name) {
					case "NotAllowedError":
					case "PermissionDeniedError":
						errorMessage = "Camera/Microphone permission denied";
						errorDetail =
							"Please allow access to your camera and microphone in browser settings";
						break;
					case "NotFoundError":
					case "DevicesNotFoundError":
						errorMessage = "No camera or microphone found";
						errorDetail = "Please connect a camera and microphone";
						break;
					case "NotReadableError":
					case "TrackStartError":
						errorMessage = "Camera/Microphone is already in use";
						errorDetail =
							"Please close other applications using your camera/microphone";
						break;
					case "OverconstrainedError":
						errorMessage = "Camera constraints not supported";
						errorDetail = "Your camera doesn't meet the requirements";
						break;
					case "SecurityError":
						errorMessage = "Security error";
						errorDetail =
							"Camera access requires HTTPS. Current protocol: " +
							window.location.protocol;
						break;
					default:
						errorMessage = "Failed to access camera/microphone";
						errorDetail = err.message || "Unknown error";
				}
			}

			setErrorDetails(errorDetail);
			toast.error(errorMessage, { description: errorDetail });
			setCameraStatus("error");
			setMicStatus("error");
		} finally {
			setIsChecking(false);
		}
	}

	function visualizeAudio() {
		if (!analyserRef.current || !canvasRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const bufferLength = analyserRef.current.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);

		function draw() {
			if (!ctx || !analyserRef.current) return;
			animationFrameRef.current = requestAnimationFrame(draw);
			analyserRef.current.getByteFrequencyData(dataArray);

			ctx.fillStyle = "rgb(30, 41, 59)"; // slate-800
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			const barWidth = (canvas.width / bufferLength) * 2.5;
			let barHeight;
			let x = 0;

			for (let i = 0; i < bufferLength; i++) {
				barHeight = dataArray[i] / 2;
				ctx.fillStyle = `rgb(${barHeight + 100}, 134, 244)`;
				ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
				x += barWidth + 1;
			}
		}

		draw();
	}

	function stopDevices() {
		console.log("Stopping devices...");

		// Cancel any pending animation frames
		if (animationFrameRef.current !== null) {
			cancelAnimationFrame(animationFrameRef.current);
			animationFrameRef.current = null;
		}

		// Stop stream tracks
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => {
				track.stop();
				console.log(`Stopped ${track.kind} track`);
			});
			streamRef.current = null;
		}

		// Stop video tracks from video element as fallback
		if (videoRef.current?.srcObject) {
			const stream = videoRef.current.srcObject as MediaStream;
			stream.getTracks().forEach((track) => {
				track.stop();
				console.log(`Stopped ${track.kind} track from video element`);
			});
			videoRef.current.srcObject = null;
		}

		// Close audio context
		if (audioContextRef.current) {
			audioContextRef.current.close().catch((err) => {
				console.error("Error closing audio context:", err);
			});
			audioContextRef.current = null;
		}

		// Clear analyser reference
		analyserRef.current = null;
		console.log("All devices stopped");
	}

	const allChecksPass = cameraStatus === "success" && micStatus === "success";

	return (
		<div className='space-y-6'>
			<div className='space-y-2'>
				<h2 className='text-2xl font-bold'>System Check</h2>
				<p className='text-muted-foreground'>
					Let's verify your camera and microphone
				</p>
			</div>

			<Card className='p-6 space-y-6'>
				<div className='grid md:grid-cols-2 gap-6'>
					{/* Camera Preview */}
					<div className='space-y-4'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<Camera className='h-5 w-5' />
								<h3 className='font-semibold'>Camera</h3>
							</div>
							<StatusIndicator status={cameraStatus} />
						</div>
						<div className='aspect-video bg-slate-900 rounded-lg overflow-hidden relative'>
							{isChecking ? (
								<div className='absolute inset-0 flex items-center justify-center'>
									<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
								</div>
							) : (
								<video
									ref={videoRef}
									autoPlay
									playsInline
									muted
									className='w-full h-full object-cover'
								/>
							)}
						</div>
					</div>

					{/* Microphone Visualizer */}
					<div className='space-y-4'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<Mic className='h-5 w-5' />
								<h3 className='font-semibold'>Microphone</h3>
							</div>
							<StatusIndicator status={micStatus} />
						</div>
						<div className='aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-4'>
							{isChecking ? (
								<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
							) : micStatus === "success" ? (
								<canvas
									ref={canvasRef}
									width='300'
									height='100'
									className='w-full'
								/>
							) : (
								<div className='text-center text-muted-foreground'>
									<AlertCircle className='h-8 w-8 mx-auto mb-2' />
									<p>Microphone access required</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Error details */}
				{errorDetails && (
					<div className='bg-red-950/30 border border-red-900 rounded-lg p-4'>
						<div className='flex items-start gap-3'>
							<AlertCircle className='h-5 w-5 text-red-500 shrink-0 mt-0.5' />
							<div className='flex-1'>
								<p className='font-semibold text-red-500 mb-1'>Error Details</p>
								<p className='text-sm text-red-300'>{errorDetails}</p>
								{window.location.protocol !== "https:" &&
									window.location.hostname !== "localhost" && (
										<p className='text-sm text-red-300 mt-2'>
											⚠️ Camera access requires HTTPS. Please ensure your site
											is served over HTTPS.
										</p>
									)}
							</div>
						</div>
					</div>
				)}

				{/* Retry button shown on error */}
				{(cameraStatus === "error" || micStatus === "error") && (
					<Button
						variant='outline'
						onClick={checkDevices}
						disabled={isChecking}
						className='w-full'
					>
						{isChecking ? "Checking..." : "Retry Device Check"}
					</Button>
				)}
			</Card>

			<div className='flex justify-between'>
				<Button variant='outline' onClick={onBack}>
					Back
				</Button>
				<Button disabled={!allChecksPass} onClick={onNext}>
					Continue to Face Verification
				</Button>
			</div>
		</div>
	);
}

function StatusIndicator({
	status,
}: {
	status: "pending" | "success" | "error";
}) {
	const variants = {
		pending: "text-yellow-500",
		success: "text-green-500",
		error: "text-red-500",
	};

	const labels = {
		pending: "Checking...",
		success: "Connected",
		error: "Error",
	};

	return (
		<div className={`flex items-center gap-1.5 ${variants[status]}`}>
			<span className='text-sm'>{labels[status]}</span>
			{status === "pending" ? (
				<Loader2 className='h-4 w-4 animate-spin' />
			) : status === "success" ? (
				<CheckCircle2 className='h-4 w-4' />
			) : (
				<AlertCircle className='h-4 w-4' />
			)}
		</div>
	);
}
