"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	ChevronLeft,
	Download,
	Play,
	Pause,
	Volume2,
	VolumeX,
} from "lucide-react";
import { toast } from "sonner";

interface VerificationArtifact {
	id: number;
	type: "face" | "room" | "id";
	url: string;
	meta?: any;
	createdAt: string;
}

interface StudentAttempt {
	id: number;
	studentId: string;
	studentName: string;
	startedAt: string;
	submittedAt: string | null;
	score: number | null;
	artifacts: VerificationArtifact[];
}

interface ExamResponsesViewerProps {
	attempt: StudentAttempt;
	onBack: () => void;
}

export default function ExamResponsesViewer({
	attempt,
	onBack,
}: ExamResponsesViewerProps) {
	const [selectedTab, setSelectedTab] = useState<"face" | "room" | "id" | null>(
		null
	);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);

	const faceArtifact = attempt.artifacts.find((a) => a.type === "face");
	const roomArtifact = attempt.artifacts.find((a) => a.type === "room");
	const idArtifact = attempt.artifacts.find((a) => a.type === "id");

	const handleDownload = async (url: string, filename: string) => {
		try {
			const response = await fetch(url);
			const blob = await response.blob();
			const blobUrl = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = blobUrl;
			link.download = filename;
			link.click();
			window.URL.revokeObjectURL(blobUrl);
			toast.success(`Downloaded ${filename}`);
		} catch (error) {
			console.error("Download error:", error);
			toast.error("Failed to download file");
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	const getArtifactLabel = (
		type: "face" | "room" | "id"
	): { label: string; icon: React.ReactNode } => {
		switch (type) {
			case "face":
				return { label: "Face Photo", icon: "📷" };
			case "room":
				return { label: "Room Scan", icon: "🎥" };
			case "id":
				return { label: "ID Document", icon: "📄" };
		}
	};

	return (
		<div className='min-h-screen bg-background text-foreground p-6'>
			<div className='max-w-6xl mx-auto'>
				{/* Header */}
				<div className='flex items-center gap-4 mb-8'>
					<Button
						variant='outline'
						size='sm'
						onClick={onBack}
						className='gap-2'
					>
						<ChevronLeft className='h-4 w-4' />
						Back to Attempts
					</Button>
					<div>
						<h1 className='text-3xl font-bold'>Exam Verification Artifacts</h1>
						<p className='text-muted-foreground'>
							{attempt.studentName} • {formatDate(attempt.startedAt)}
						</p>
					</div>
				</div>

				{/* Artifacts Overview */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
					{faceArtifact && (
						<Card
							className={`p-4 cursor-pointer transition-colors ${
								selectedTab === "face"
									? "border-primary bg-card/80"
									: "hover:border-primary/50"
							}`}
							onClick={() => setSelectedTab("face")}
						>
							<div className='text-3xl mb-2'>📷</div>
							<h3 className='font-semibold mb-1'>Face Photo</h3>
							<p className='text-sm text-muted-foreground mb-3'>
								{formatDate(faceArtifact.createdAt)}
							</p>
							<Button
								variant='secondary'
								size='sm'
								onClick={(e) => {
									e.stopPropagation();
									handleDownload(faceArtifact.url, "face-photo.jpg");
								}}
								className='w-full gap-2'
							>
								<Download className='h-4 w-4' />
								Download
							</Button>
						</Card>
					)}

					{roomArtifact && (
						<Card
							className={`p-4 cursor-pointer transition-colors ${
								selectedTab === "room"
									? "border-primary bg-card/80"
									: "hover:border-primary/50"
							}`}
							onClick={() => setSelectedTab("room")}
						>
							<div className='text-3xl mb-2'>🎥</div>
							<h3 className='font-semibold mb-1'>Room Scan</h3>
							<p className='text-sm text-muted-foreground mb-3'>
								{formatDate(roomArtifact.createdAt)}
							</p>
							<Button
								variant='secondary'
								size='sm'
								onClick={(e) => {
									e.stopPropagation();
									handleDownload(roomArtifact.url, "room-scan.mp4");
								}}
								className='w-full gap-2'
							>
								<Download className='h-4 w-4' />
								Download
							</Button>
						</Card>
					)}

					{idArtifact && (
						<Card
							className={`p-4 cursor-pointer transition-colors ${
								selectedTab === "id"
									? "border-primary bg-card/80"
									: "hover:border-primary/50"
							}`}
							onClick={() => setSelectedTab("id")}
						>
							<div className='text-3xl mb-2'>📄</div>
							<h3 className='font-semibold mb-1'>ID Document</h3>
							<p className='text-sm text-muted-foreground mb-3'>
								{formatDate(idArtifact.createdAt)}
							</p>
							<Button
								variant='secondary'
								size='sm'
								onClick={(e) => {
									e.stopPropagation();
									handleDownload(idArtifact.url, "id-document.jpg");
								}}
								className='w-full gap-2'
							>
								<Download className='h-4 w-4' />
								Download
							</Button>
						</Card>
					)}
				</div>

				{/* Detailed View */}
				{selectedTab && (
					<Card className='p-8'>
						<div className='space-y-6'>
							{selectedTab === "face" && faceArtifact && (
								<div className='space-y-4'>
									<h2 className='text-2xl font-bold'>📷 Face Photo</h2>
									<div className='bg-card rounded-lg overflow-hidden'>
										<img
											src={faceArtifact.url}
											alt='Face verification photo'
											className='w-full max-h-96 object-cover'
										/>
									</div>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<p className='text-sm text-muted-foreground'>Captured</p>
											<p className='font-medium'>
												{formatDate(faceArtifact.createdAt)}
											</p>
										</div>
										{faceArtifact.meta?.timestamp && (
											<div>
												<p className='text-sm text-muted-foreground'>
													Metadata
												</p>
												<p className='font-medium'>
													{faceArtifact.meta.timestamp}
												</p>
											</div>
										)}
									</div>
								</div>
							)}

							{selectedTab === "room" && roomArtifact && (
								<div className='space-y-4'>
									<h2 className='text-2xl font-bold'>🎥 Room Scan</h2>
									<div className='bg-card rounded-lg overflow-hidden'>
										<video
											src={roomArtifact.url}
											className='w-full max-h-96 bg-black'
											controls
											controlsList='nodownload'
										/>
									</div>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<p className='text-sm text-muted-foreground'>Captured</p>
											<p className='font-medium'>
												{formatDate(roomArtifact.createdAt)}
											</p>
										</div>
										{roomArtifact.meta?.duration && (
											<div>
												<p className='text-sm text-muted-foreground'>
													Duration
												</p>
												<p className='font-medium'>
													{Math.round(roomArtifact.meta.duration)}s
												</p>
											</div>
										)}
									</div>
								</div>
							)}

							{selectedTab === "id" && idArtifact && (
								<div className='space-y-4'>
									<h2 className='text-2xl font-bold'>📄 ID Document</h2>
									<div className='bg-card rounded-lg overflow-hidden'>
										<img
											src={idArtifact.url}
											alt='ID document'
											className='w-full max-h-96 object-cover'
										/>
									</div>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<p className='text-sm text-muted-foreground'>Captured</p>
											<p className='font-medium'>
												{formatDate(idArtifact.createdAt)}
											</p>
										</div>
										{idArtifact.meta?.filename && (
											<div>
												<p className='text-sm text-muted-foreground'>
													Filename
												</p>
												<p className='font-medium text-xs break-all'>
													{idArtifact.meta.filename}
												</p>
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					</Card>
				)}

				{/* No artifacts message */}
				{attempt.artifacts.length === 0 && (
					<Card className='p-8 text-center'>
						<p className='text-muted-foreground'>
							No verification artifacts found for this attempt.
						</p>
					</Card>
				)}

				{/* Attempt Summary */}
				<Card className='p-6 mt-8 bg-card/50'>
					<h3 className='font-semibold mb-4'>Attempt Summary</h3>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
						<div>
							<p className='text-sm text-muted-foreground'>Student ID</p>
							<p className='font-medium text-sm break-all'>
								{attempt.studentId}
							</p>
						</div>
						<div>
							<p className='text-sm text-muted-foreground'>Started</p>
							<p className='font-medium text-sm'>
								{formatDate(attempt.startedAt)}
							</p>
						</div>
						<div>
							<p className='text-sm text-muted-foreground'>Submitted</p>
							<p className='font-medium text-sm'>
								{attempt.submittedAt
									? formatDate(attempt.submittedAt)
									: "In Progress"}
							</p>
						</div>
						<div>
							<p className='text-sm text-muted-foreground'>Score</p>
							<p className='font-medium text-sm'>
								{attempt.score !== null
									? `${attempt.score} points`
									: "Not graded"}
							</p>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
