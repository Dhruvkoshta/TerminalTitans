"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, Mic, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Webcam from "react-webcam";

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
	const [isChecking, setIsChecking] = useState(true);
	const webcamRef = useRef<Webcam>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationFrameRef = useRef<number | null>(null);
	const [errorMessage, setErrorMessage] = useState<string>("");

	useEffect(() => {
		return () => {
			stopAudioVisualization();
		};
	}, []);

	const handleUserMedia = useCallback(() => {
		console.log("Webcam loaded successfully");
		setCameraStatus("success");
		setIsChecking(false);
		setTimeout(setupAudio, 100);
	}, []);

	const handleUserMediaError = useCallback((error: string | DOMException) => {
		console.error("Webcam error:", error);
		setCameraStatus("error");
		setMicStatus("error");
		setIsChecking(false);

		let errMsg = "Failed to access camera/microphone";
		if (typeof error === "string") {
			errMsg = error;
		} else if (error instanceof DOMException) {
			switch (error.name) {
				case "NotAllowedError":
				case "PermissionDeniedError":
					errMsg =
						"Permission denied. Please allow camera and microphone access.";
					break;
				case "NotFoundError":
					errMsg = "No camera or microphone found.";
					break;
				case "NotReadableError":
					errMsg = "Camera/microphone is already in use.";
					break;
				default:
					errMsg = error.message || "Unknown error";
			}
		}

		setErrorMessage(errMsg);
		toast.error("Device Access Failed", { description: errMsg });
	}, []);

	async function setupAudio() {
		try {
			const stream = webcamRef.current?.stream;
			if (!stream) {
				console.log("No stream available yet");
				return;
			}

			const audioTracks = stream.getAudioTracks();
			if (audioTracks.length === 0) {
				throw new Error("No audio track found");
			}

			console.log("Setting up audio visualizer...");
			const audioContext = new (window.AudioContext ||
				(window as any).webkitAudioContext)();
			const analyser = audioContext.createAnalyser();
			const source = audioContext.createMediaStreamSource(stream);
			source.connect(analyser);
			analyser.fftSize = 256;

			audioContextRef.current = audioContext;
			analyserRef.current = analyser;
			setMicStatus("success");

			console.log("Audio visualizer setup complete");
			visualizeAudio();
		} catch (err) {
			console.error("Audio setup error:", err);
			setMicStatus("error");
			const errMsg =
				err instanceof Error ? err.message : "Failed to setup microphone";
			toast.error("Microphone Error", { description: errMsg });
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

			ctx.fillStyle = "hsl(var(--background))";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			const barWidth = (canvas.width / bufferLength) * 2.5;
			let barHeight;
			let x = 0;

			for (let i = 0; i < bufferLength; i++) {
				barHeight = dataArray[i] / 2;
				ctx.fillStyle = "hsl(var(--primary))";
				ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
				x += barWidth + 1;
			}
		}

		draw();
	}

	function stopAudioVisualization() {
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
			animationFrameRef.current = null;
		}

		if (audioContextRef.current) {
			audioContextRef.current.close().catch(console.error);
			audioContextRef.current = null;
		}

		analyserRef.current = null;
	}

	const allChecksPass = cameraStatus === "success" && micStatus === "success";

	const videoConstraints = {
		width: 1280,
		height: 720,
		facingMode: "user",
	};

	const audioConstraints = {
		echoCancellation: true,
		noiseSuppression: true,
	};

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
					<div className='space-y-4'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<Camera className='h-5 w-5' />
								<h3 className='font-semibold'>Camera</h3>
							</div>
							<StatusIndicator status={cameraStatus} />
						</div>
						<div className='aspect-video bg-secondary/20 dark:bg-secondary/10 rounded-lg overflow-hidden relative border border-secondary/30'>
							{isChecking && (
								<div className='absolute inset-0 flex items-center justify-center z-10'>
									<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
								</div>
							)}
							<Webcam
								ref={webcamRef}
								audio={true}
								videoConstraints={videoConstraints}
								audioConstraints={audioConstraints}
								onUserMedia={handleUserMedia}
								onUserMediaError={handleUserMediaError}
								mirrored={true}
								className='w-full h-full object-cover'
							/>
						</div>
					</div>

					<div className='space-y-4'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<Mic className='h-5 w-5' />
								<h3 className='font-semibold'>Microphone</h3>
							</div>
							<StatusIndicator status={micStatus} />
						</div>
						<div className='aspect-video bg-secondary/20 dark:bg-secondary/10 rounded-lg overflow-hidden flex items-center justify-center p-4 border border-secondary/30'>
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

				{errorMessage && (
					<div className='bg-destructive/10 border border-destructive rounded-lg p-4'>
						<div className='flex items-start gap-3'>
							<AlertCircle className='h-5 w-5 text-destructive shrink-0 mt-0.5' />
							<div className='flex-1'>
								<p className='font-semibold text-destructive mb-1'>Error</p>
								<p className='text-sm text-destructive/80'>{errorMessage}</p>
							</div>
						</div>
					</div>
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
		error: "text-destructive",
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
