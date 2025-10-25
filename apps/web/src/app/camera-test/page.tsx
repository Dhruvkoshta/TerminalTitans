"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
	Camera,
	Mic,
	AlertCircle,
	CheckCircle2,
	RefreshCcw,
} from "lucide-react";

export default function CameraTestPage() {
	const [diagnostics, setDiagnostics] = useState<any>({});
	const [cameraStatus, setCameraStatus] = useState<
		"idle" | "checking" | "success" | "error"
	>("idle");
	const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);

	useEffect(() => {
		runDiagnostics();
		return () => stopCamera();
	}, []);

	async function runDiagnostics() {
		const diag: any = {
			timestamp: new Date().toISOString(),
			userAgent: navigator.userAgent,
			protocol: window.location.protocol,
			hostname: window.location.hostname,
			isSecureContext: window.isSecureContext,
			hasGetUserMedia: !!(
				navigator.mediaDevices && navigator.mediaDevices.getUserMedia
			),
			hasEnumerateDevices: !!(
				navigator.mediaDevices && navigator.mediaDevices.enumerateDevices
			),
		};

		// Check permissions API
		if ("permissions" in navigator) {
			try {
				const cameraPermission = await (navigator.permissions as any).query({
					name: "camera",
				});
				diag.cameraPermission = cameraPermission.state;
				const micPermission = await (navigator.permissions as any).query({
					name: "microphone",
				});
				diag.microphonePermission = micPermission.state;
			} catch (err) {
				diag.permissionsApiError =
					err instanceof Error ? err.message : String(err);
			}
		}

		// Enumerate devices
		if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
			try {
				const deviceList = await navigator.mediaDevices.enumerateDevices();
				setDevices(deviceList);
				diag.videoInputs = deviceList.filter(
					(d) => d.kind === "videoinput"
				).length;
				diag.audioInputs = deviceList.filter(
					(d) => d.kind === "audioinput"
				).length;
				diag.audioOutputs = deviceList.filter(
					(d) => d.kind === "audiooutput"
				).length;
			} catch (err) {
				diag.enumerateDevicesError =
					err instanceof Error ? err.message : String(err);
			}
		}

		setDiagnostics(diag);
	}

	async function testCamera() {
		setCameraStatus("checking");
		stopCamera(); // Stop any existing stream

		try {
			console.log("Testing camera access...");

			// Test basic constraints
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
				console.log("Camera access granted with ideal constraints");
			} catch (idealErr) {
				console.warn("Ideal constraints failed:", idealErr);
				// Fallback to basic
				stream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true,
				});
				console.log("Camera access granted with basic constraints");
			}

			streamRef.current = stream;
			console.log(
				"Stream tracks:",
				stream
					.getTracks()
					.map((t) => ({
						kind: t.kind,
						enabled: t.enabled,
						readyState: t.readyState,
					}))
			);

			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				await videoRef.current.play();
				setCameraStatus("success");
				toast.success("Camera and microphone access successful!");
			}

			// Re-enumerate devices after permission granted
			const deviceList = await navigator.mediaDevices.enumerateDevices();
			setDevices(deviceList);
		} catch (err) {
			console.error("Camera test error:", err);
			setCameraStatus("error");

			let errorMessage = "Camera access failed";
			let errorDetail = "";

			if (err instanceof Error) {
				errorDetail = err.message;

				switch (err.name) {
					case "NotAllowedError":
					case "PermissionDeniedError":
						errorMessage = "Permission denied";
						errorDetail =
							"Please allow camera and microphone access in your browser settings";
						break;
					case "NotFoundError":
					case "DevicesNotFoundError":
						errorMessage = "No devices found";
						errorDetail = "No camera or microphone detected";
						break;
					case "NotReadableError":
					case "TrackStartError":
						errorMessage = "Device in use";
						errorDetail =
							"Camera or microphone is already being used by another application";
						break;
					case "OverconstrainedError":
						errorMessage = "Constraints not supported";
						errorDetail = "Your camera doesn't support the requested settings";
						break;
					case "SecurityError":
						errorMessage = "Security error";
						errorDetail =
							window.location.protocol !== "https:"
								? "Camera access requires HTTPS in production"
								: "Security policy prevents camera access";
						break;
					default:
						errorMessage = "Unknown error";
				}
			}

			toast.error(errorMessage, { description: errorDetail });

			setDiagnostics((prev: any) => ({
				...prev,
				lastError: {
					name: (err as any)?.name,
					message: (err as any)?.message,
					errorMessage,
					errorDetail,
				},
			}));
		}
	}

	function stopCamera() {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => {
				track.stop();
				console.log(`Stopped ${track.kind} track`);
			});
			streamRef.current = null;
		}

		if (videoRef.current?.srcObject) {
			const stream = videoRef.current.srcObject as MediaStream;
			stream.getTracks().forEach((track) => track.stop());
			videoRef.current.srcObject = null;
		}

		if (cameraStatus === "success") {
			setCameraStatus("idle");
		}
	}

	return (
		<div className='container mx-auto py-8 max-w-6xl'>
			<div className='space-y-6'>
				<div>
					<h1 className='text-3xl font-bold mb-2'>Camera Diagnostic Tool</h1>
					<p className='text-muted-foreground'>
						Use this page to test camera and microphone access and diagnose
						issues
					</p>
				</div>

				<Card className='p-6'>
					<h2 className='text-xl font-semibold mb-4'>System Information</h2>
					<div className='grid grid-cols-2 gap-4 text-sm'>
						<div>
							<span className='font-medium'>Protocol:</span>
							<span
								className={`ml-2 ${
									diagnostics.protocol === "https:"
										? "text-green-500"
										: "text-red-500"
								}`}
							>
								{diagnostics.protocol}
							</span>
						</div>
						<div>
							<span className='font-medium'>Secure Context:</span>
							<span
								className={`ml-2 ${
									diagnostics.isSecureContext
										? "text-green-500"
										: "text-red-500"
								}`}
							>
								{diagnostics.isSecureContext ? "Yes" : "No"}
							</span>
						</div>
						<div>
							<span className='font-medium'>getUserMedia:</span>
							<span
								className={`ml-2 ${
									diagnostics.hasGetUserMedia
										? "text-green-500"
										: "text-red-500"
								}`}
							>
								{diagnostics.hasGetUserMedia ? "Available" : "Not Available"}
							</span>
						</div>
						<div>
							<span className='font-medium'>Hostname:</span>
							<span className='ml-2'>{diagnostics.hostname}</span>
						</div>
						{diagnostics.cameraPermission && (
							<div>
								<span className='font-medium'>Camera Permission:</span>
								<span className='ml-2'>{diagnostics.cameraPermission}</span>
							</div>
						)}
						{diagnostics.microphonePermission && (
							<div>
								<span className='font-medium'>Mic Permission:</span>
								<span className='ml-2'>{diagnostics.microphonePermission}</span>
							</div>
						)}
					</div>

					{!diagnostics.isSecureContext && (
						<div className='mt-4 p-4 bg-red-950/30 border border-red-900 rounded-lg'>
							<div className='flex items-start gap-3'>
								<AlertCircle className='h-5 w-5 text-red-500 shrink-0 mt-0.5' />
								<div>
									<p className='font-semibold text-red-500'>
										Not a Secure Context
									</p>
									<p className='text-sm text-red-300 mt-1'>
										Camera access requires HTTPS in production. Your current
										protocol is {diagnostics.protocol}
									</p>
								</div>
							</div>
						</div>
					)}
				</Card>

				<Card className='p-6'>
					<h2 className='text-xl font-semibold mb-4'>Devices Detected</h2>
					<div className='space-y-2'>
						<div className='flex items-center gap-2'>
							<Camera className='h-5 w-5' />
							<span>Video Inputs: {diagnostics.videoInputs || 0}</span>
						</div>
						<div className='flex items-center gap-2'>
							<Mic className='h-5 w-5' />
							<span>Audio Inputs: {diagnostics.audioInputs || 0}</span>
						</div>

						{devices.length > 0 && (
							<details className='mt-4'>
								<summary className='cursor-pointer font-medium'>
									Device Details
								</summary>
								<div className='mt-2 space-y-2'>
									{devices.map((device, i) => (
										<div key={i} className='text-sm p-2 bg-muted rounded'>
											<div>
												<strong>Kind:</strong> {device.kind}
											</div>
											<div>
												<strong>Label:</strong>{" "}
												{device.label || "(no label - permission needed)"}
											</div>
											<div>
												<strong>ID:</strong> {device.deviceId}
											</div>
										</div>
									))}
								</div>
							</details>
						)}
					</div>
				</Card>

				<Card className='p-6'>
					<h2 className='text-xl font-semibold mb-4'>Camera Test</h2>

					<div className='aspect-video bg-slate-900 rounded-lg overflow-hidden mb-4 relative'>
						{cameraStatus === "checking" ? (
							<div className='absolute inset-0 flex flex-col items-center justify-center gap-2'>
								<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary' />
								<p className='text-muted-foreground'>
									Requesting camera access...
								</p>
							</div>
						) : cameraStatus === "success" ? (
							<video
								ref={videoRef}
								autoPlay
								playsInline
								muted
								className='w-full h-full object-cover'
							/>
						) : (
							<div className='absolute inset-0 flex flex-col items-center justify-center gap-2'>
								<Camera className='h-12 w-12 text-muted-foreground' />
								<p className='text-muted-foreground'>
									{cameraStatus === "error"
										? "Camera access failed"
										: "Click 'Test Camera' to start"}
								</p>
							</div>
						)}
					</div>

					<div className='flex gap-2'>
						<Button
							onClick={testCamera}
							disabled={cameraStatus === "checking"}
							className='flex-1'
						>
							{cameraStatus === "checking" ? "Testing..." : "Test Camera"}
						</Button>
						{cameraStatus === "success" && (
							<Button onClick={stopCamera} variant='outline'>
								Stop Camera
							</Button>
						)}
						<Button onClick={runDiagnostics} variant='outline'>
							<RefreshCcw className='h-4 w-4' />
						</Button>
					</div>

					{cameraStatus === "success" && (
						<div className='mt-4 p-4 bg-green-950/30 border border-green-900 rounded-lg'>
							<div className='flex items-center gap-2 text-green-500'>
								<CheckCircle2 className='h-5 w-5' />
								<span className='font-semibold'>
									Camera and Microphone Working!
								</span>
							</div>
						</div>
					)}

					{diagnostics.lastError && (
						<div className='mt-4 p-4 bg-red-950/30 border border-red-900 rounded-lg'>
							<div className='flex items-start gap-3'>
								<AlertCircle className='h-5 w-5 text-red-500 shrink-0 mt-0.5' />
								<div className='flex-1'>
									<p className='font-semibold text-red-500'>
										{diagnostics.lastError.errorMessage}
									</p>
									<p className='text-sm text-red-300 mt-1'>
										{diagnostics.lastError.errorDetail}
									</p>
									<details className='mt-2'>
										<summary className='cursor-pointer text-sm text-red-400'>
											Technical Details
										</summary>
										<pre className='text-xs mt-2 p-2 bg-black/30 rounded overflow-auto'>
											{JSON.stringify(diagnostics.lastError, null, 2)}
										</pre>
									</details>
								</div>
							</div>
						</div>
					)}
				</Card>

				<Card className='p-6'>
					<h2 className='text-xl font-semibold mb-4'>Full Diagnostics</h2>
					<pre className='text-xs p-4 bg-muted rounded overflow-auto max-h-96'>
						{JSON.stringify(diagnostics, null, 2)}
					</pre>
				</Card>
			</div>
		</div>
	);
}
