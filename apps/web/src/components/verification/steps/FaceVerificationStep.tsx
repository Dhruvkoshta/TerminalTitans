"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, Check, RefreshCcw } from "lucide-react";
import Webcam from "react-webcam";
import { uploadCanvasToVercelBlob } from "@/lib/blob-storage";

interface FaceVerificationStepProps {
	onNext: () => void;
	onBack: () => void;
	onCapture: (imageDataUrl: string) => void;
}

export default function FaceVerificationStep({
	onNext,
	onBack,
	onCapture,
}: FaceVerificationStepProps) {
	const [isCameraReady, setIsCameraReady] = useState(false);
	const [isCapturing, setIsCapturing] = useState(false);
	const [capturedImage, setCapturedImage] = useState<string | null>(null);
	const webcamRef = useRef<Webcam>(null);

	const handleUserMedia = useCallback(() => {
		console.log("Face verification camera ready");
		setIsCameraReady(true);
	}, []);

	const handleUserMediaError = useCallback((error: string | DOMException) => {
		console.error("Camera error in face verification:", error);
		const errMsg =
			typeof error === "string" ? error : error.message || "Camera error";
		toast.error("Failed to access camera", { description: errMsg });
	}, []);

	async function capturePhoto() {
		if (!webcamRef.current) return;

		setIsCapturing(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 500));

			const imageSrc = webcamRef.current.getScreenshot();
			if (!imageSrc) {
				throw new Error("Failed to capture screenshot");
			}

			// Convert to blob and upload to Vercel Blob
			const response = await fetch(imageSrc);
			const blob = await response.blob();

			const url = await uploadCanvasToVercelBlob(
				imageSrc,
				`face-${Date.now()}.jpg`
			);

			setCapturedImage(url);
			onCapture(url);
			toast.success("Photo captured successfully!");
		} catch (error) {
			console.error("Capture error:", error);
			toast.error("Failed to capture photo");
		} finally {
			setIsCapturing(false);
		}
	}

	function retake() {
		setCapturedImage(null);
	}

	const videoConstraints = {
		width: 1280,
		height: 720,
		facingMode: "user",
	};

	return (
		<div className='space-y-6'>
			<div className='space-y-2'>
				<h2 className='text-2xl font-bold'>Face Verification</h2>
				<p className='text-muted-foreground'>
					Please center your face in the frame and ensure good lighting
				</p>
			</div>

			<Card className='p-6'>
				<div className='aspect-video bg-card rounded-lg overflow-hidden relative mb-4'>
					{!capturedImage ? (
						<Webcam
							ref={webcamRef}
							audio={false}
							screenshotFormat='image/jpeg'
							videoConstraints={videoConstraints}
							onUserMedia={handleUserMedia}
							onUserMediaError={handleUserMediaError}
							mirrored={true}
							className='w-full h-full object-cover'
						/>
					) : (
						<img
							src={capturedImage}
							alt='Captured face'
							className='w-full h-full object-cover'
						/>
					)}
				</div>

				<div className='flex gap-2'>
					{!capturedImage ? (
						<Button
							onClick={capturePhoto}
							disabled={!isCameraReady || isCapturing}
							className='flex-1'
						>
							<Camera className='mr-2 h-4 w-4' />
							{isCapturing ? "Capturing..." : "Capture Photo"}
						</Button>
					) : (
						<>
							<Button onClick={retake} variant='outline' className='flex-1'>
								<RefreshCcw className='mr-2 h-4 w-4' />
								Retake
							</Button>
							<Button onClick={onNext} className='flex-1'>
								<Check className='mr-2 h-4 w-4' />
								Continue
							</Button>
						</>
					)}
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
