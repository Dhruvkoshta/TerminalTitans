"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import WelcomeStep from "./steps/WelcomeStep";
import SystemCheckStep from "./steps/SystemCheckStep";
import FaceVerificationStep from "./steps/FaceVerificationStep";
import RoomScanStep from "./steps/RoomScanStep";
import ConfirmationStep from "./steps/ConfirmationStep";
import { authClient } from "@/lib/auth-client";

interface VerificationWizardProps {
	examCode: string;
	examName: string;
	durationMins: number;
	examLink?: string;
}

export default function VerificationWizard({
	examCode,
	examName,
	durationMins,
	examLink,
}: VerificationWizardProps) {
	const [step, setStep] = useState(1);
	const router = useRouter();
	const { data: session } = authClient.useSession();

	const [facePhoto, setFacePhoto] = useState<string | null>(null);
	const [roomScan, setRoomScan] = useState<string | null>(null);

	useEffect(() => {
		// Clean up any active media streams when unmounting
		return () => {
			navigator.mediaDevices
				.getUserMedia({ video: true, audio: true })
				.then((stream) => {
					stream.getTracks().forEach((track) => track.stop());
				})
				.catch(() => {});
		};
	}, []);

	function nextStep() {
		setStep((prev) => prev + 1);
	}

	function previousStep() {
		setStep((prev) => prev - 1);
	}

	async function onComplete() {
		try {
			const studentEmail = session?.user?.email || "";
			const studentName = session?.user?.name || "";

			const artifacts: Array<{ type: string; url: string; meta?: any }> = [];
			if (facePhoto) artifacts.push({ type: "face", url: facePhoto });
			if (roomScan) artifacts.push({ type: "room", url: roomScan });

			await fetch("/api/exams/verify", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					exam_code: examCode,
					studentId: studentEmail,
					artifacts,
				}),
			});

			toast.success("Verification completed successfully!");
			const q = new URLSearchParams({
				exam_code: examCode,
				mins_left: String(durationMins ?? 15),
				secs_left: "0",
				student_name: studentName,
				student_email: studentEmail,
				exam_link: examLink || "",
			});
			router.push(`/student-exam?${q.toString()}`);
		} catch (error) {
			toast.error("Failed to complete verification. Please try again.");
		}
	}

	const steps = [
		{ name: "Welcome & Rules", description: "Review and accept exam rules" },
		{ name: "System Check", description: "Verify webcam and microphone" },
		{
			name: "Face Verification",
			description: "Capture a clear photo of your face",
		},
		{ name: "Room Scan", description: "Show your exam environment" },
		{ name: "Ready to Begin", description: "Start your exam" },
	];

	const studentName = session?.user?.name || "";

	return (
		<div className='min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4'>
			<div className='w-full max-w-4xl space-y-8'>
				{/* Progress bar */}
				<div className='space-y-4'>
					<div className='flex justify-between text-sm'>
						{steps.map(({ name, description }, index) => (
							<div
								key={name}
								className={`flex flex-col items-center gap-2 ${
									index + 1 === step
										? "text-primary"
										: index + 1 < step
										? "text-primary/60"
										: "text-muted-foreground"
								}`}
							>
								<div className='hidden sm:flex flex-col text-center gap-1 max-w-[120px]'>
									<span className='font-medium'>{name}</span>
									<span className='text-xs text-muted-foreground'>
										{description}
									</span>
								</div>
								<div
									className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
										index + 1 === step
											? "border-primary bg-primary/10"
											: index + 1 < step
											? "border-primary/60 bg-primary/60"
											: "border-muted-foreground"
									}`}
								>
									{index + 1}
								</div>
							</div>
						))}
					</div>
					<div className='relative h-2 bg-slate-800 rounded-full overflow-hidden'>
						<div
							className='absolute inset-y-0 left-0 bg-primary transition-all duration-300'
							style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
						/>
					</div>
				</div>

				{/* Step content */}
				<div>
					{step === 1 && (
						<WelcomeStep
							studentName={studentName}
							examName={examName}
							onNext={nextStep}
						/>
					)}
					{step === 2 && (
						<SystemCheckStep onNext={nextStep} onBack={previousStep} />
					)}
					{step === 3 && (
						<FaceVerificationStep
							onNext={nextStep}
							onBack={previousStep}
							onCapture={(img) => setFacePhoto(img)}
						/>
					)}
					{step === 4 && (
						<RoomScanStep
							onNext={nextStep}
							onBack={previousStep}
							onCapture={(url) => setRoomScan(url)}
						/>
					)}
					{step === 5 && (
						<ConfirmationStep
							studentName={studentName}
							examName={examName}
							onFinish={onComplete}
							onBack={previousStep}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
