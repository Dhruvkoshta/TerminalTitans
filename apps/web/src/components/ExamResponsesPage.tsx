"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
	ArrowLeft,
	User,
	CheckCircle2,
	XCircle,
	Clock,
	FileText,
	Code2,
	Award,
	Image,
	Video,
	Download,
} from "lucide-react";
import ExamResponsesViewer from "@/components/instructor/ExamResponsesViewer";

interface VerificationArtifact {
	id: number;
	attemptId: number;
	type: "face" | "room" | "id";
	url: string;
	meta?: any;
	createdAt: string;
}

interface Response {
	response: {
		id: number;
		answerText: string | null;
		answerJson: Record<string, unknown> | null;
		isCorrect: boolean;
		awardedPoints: number;
	};
	question: {
		id: number;
		type: string;
		title: string;
		prompt: string;
		points: number;
	} | null;
}

interface Attempt {
	id: number;
	examId: number;
	studentId: string;
	startedAt: Date | null;
	submittedAt: Date | null;
	score: number | null;
	proctoringSummary: Record<string, unknown> | null;
	responses: Response[];
	artifacts?: VerificationArtifact[];
}

interface Exam {
	id: number;
	name: string;
	dateTimeStart: Date | null;
	duration: number;
}

interface ExamResponseData {
	exam: Exam;
	questions: Array<{
		id: number;
		type: string;
		title: string;
		prompt: string;
		points: number;
	}>;
	attempts: Attempt[];
}

export default function ExamResponsesPage({ examId }: { examId: string }) {
	const [data, setData] = useState<ExamResponseData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);
	const router = useRouter();

	useEffect(() => {
		const fetchResponses = async () => {
			try {
				const response = await fetch(`/api/exams/responses?exam_id=${examId}`);
				if (!response.ok) {
					throw new Error("Failed to fetch responses");
				}
				const responseData = await response.json();
				setData(responseData);
			} catch (error) {
				console.error("Error fetching responses:", error);
				toast.error("Failed to load exam responses");
			} finally {
				setIsLoading(false);
			}
		};

		fetchResponses();
	}, [examId]);

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
				<div className='text-center'>
					<div className='w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
					<p className='text-gray-600 dark:text-gray-400'>
						Loading responses...
					</p>
				</div>
			</div>
		);
	}

	if (!data) {
		return (
			<div className='flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
				<Card className='max-w-md w-full'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2 text-red-600'>
							<XCircle className='w-6 h-6' />
							Failed to Load
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-gray-600 dark:text-gray-400 mb-4'>
							Unable to load exam responses.
						</p>
						<Button onClick={() => router.back()} className='w-full'>
							<ArrowLeft className='w-5 h-5 mr-2' />
							Go Back
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const totalPoints = data.questions.reduce((sum, q) => sum + q.points, 0);

	return (
		<div className='min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6'>
			<div className='max-w-7xl mx-auto'>
				{/* Header */}
				<div className='mb-6'>
					<Button
						variant='outline'
						onClick={() => router.back()}
						className='mb-4'
					>
						<ArrowLeft className='w-5 h-5 mr-2' />
						Back to Dashboard
					</Button>
					<div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6'>
						<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
							{data.exam.name}
						</h1>
						<div className='flex items-center gap-6 text-gray-600 dark:text-gray-400'>
							<div className='flex items-center gap-2'>
								<User className='w-5 h-5' />
								<span>{data.attempts.length} submissions</span>
							</div>
							<div className='flex items-center gap-2'>
								<FileText className='w-5 h-5' />
								<span>{data.questions.length} questions</span>
							</div>
							<div className='flex items-center gap-2'>
								<Award className='w-5 h-5' />
								<span>{totalPoints} total points</span>
							</div>
						</div>
					</div>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					{/* Student Attempts List */}
					<div className='lg:col-span-1'>
						<Card className='shadow-xl'>
							<CardHeader className='bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-t-lg'>
								<CardTitle>Student Submissions</CardTitle>
								<CardDescription className='text-blue-100'>
									Click to view details
								</CardDescription>
							</CardHeader>
							<CardContent className='p-4 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto'>
								{data.attempts.length === 0 ? (
									<p className='text-center text-gray-500 dark:text-gray-400 py-8'>
										No submissions yet
									</p>
								) : (
									data.attempts.map((attempt) => {
										const percentage =
											totalPoints > 0
												? ((attempt.score || 0) / totalPoints) * 100
												: 0;
										return (
											<button
												key={attempt.id}
												onClick={() => setSelectedAttempt(attempt)}
												className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
													selectedAttempt?.id === attempt.id
														? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
														: "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-800"
												}`}
											>
												<div className='flex items-center justify-between mb-2'>
													<div className='flex items-center gap-2'>
														<User className='w-4 h-4' />
														<span className='font-semibold text-sm'>
															{attempt.studentId}
														</span>
													</div>
													{attempt.submittedAt && (
														<CheckCircle2 className='w-5 h-5 text-green-500' />
													)}
												</div>
												<div className='space-y-1'>
													<div className='flex items-center justify-between text-xs'>
														<span className='text-gray-600 dark:text-gray-400'>
															Score:
														</span>
														<span className='font-bold text-blue-600 dark:text-blue-400'>
															{attempt.score || 0}/{totalPoints} (
															{percentage.toFixed(0)}%)
														</span>
													</div>
													{attempt.submittedAt && (
														<div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
															<Clock className='w-3 h-3' />
															{new Date(attempt.submittedAt).toLocaleString()}
														</div>
													)}
												</div>
											</button>
										);
									})
								)}
							</CardContent>
						</Card>
					</div>

					{/* Response Details */}
					<div className='lg:col-span-2'>
						{!selectedAttempt ? (
							<Card className='shadow-xl'>
								<CardContent className='p-12 text-center'>
									<FileText className='w-16 h-16 text-gray-400 mx-auto mb-4' />
									<h3 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>
										No Submission Selected
									</h3>
									<p className='text-gray-500 dark:text-gray-400'>
										Select a student submission to view their responses
									</p>
								</CardContent>
							</Card>
						) : (
							<div className='space-y-4'>
								{/* Student Info Card */}
								<Card className='shadow-xl'>
									<CardHeader className='bg-linear-to-r from-green-500 to-green-600 text-white rounded-t-lg'>
										<div className='flex items-center justify-between'>
											<div>
												<CardTitle className='flex items-center gap-2'>
													<User className='w-6 h-6' />
													{selectedAttempt.studentId}
												</CardTitle>
												<CardDescription className='text-green-100'>
													Submission Details
												</CardDescription>
											</div>
											<div className='text-right'>
												<div className='text-3xl font-bold'>
													{selectedAttempt.score || 0}/{totalPoints}
												</div>
												<div className='text-sm'>
													{totalPoints > 0
														? (
																((selectedAttempt.score || 0) / totalPoints) *
																100
														  ).toFixed(1)
														: 0}
													%
												</div>
											</div>
										</div>
									</CardHeader>
								</Card>

								{/* Responses */}
								{selectedAttempt.responses.map((response, idx) => {
									if (!response.question) return null;
									const question = response.question;

									return (
										<Card key={response.response.id} className='shadow-lg'>
											<CardHeader className='bg-gray-50 dark:bg-gray-800/50'>
												<div className='flex items-start justify-between'>
													<div className='flex-1'>
														<CardTitle className='text-lg flex items-center gap-2 mb-2'>
															{question.type === "mcq" && (
																<CheckCircle2 className='w-5 h-5' />
															)}
															{question.type === "coding" && (
																<Code2 className='w-5 h-5' />
															)}
															{question.type === "short" && (
																<FileText className='w-5 h-5' />
															)}
															Question {idx + 1}: {question.title}
														</CardTitle>
														<p className='text-sm text-gray-600 dark:text-gray-400'>
															{question.prompt}
														</p>
													</div>
													<div className='ml-4'>
														<div
															className={`px-3 py-1 rounded-full text-sm font-semibold ${
																response.response.isCorrect
																	? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
																	: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
															}`}
														>
															{response.response.awardedPoints}/
															{question.points}
														</div>
													</div>
												</div>
											</CardHeader>
											<CardContent className='p-4'>
												<div className='space-y-2'>
													<Label className='font-semibold'>
														Student Answer:
													</Label>
													{question.type === "mcq" &&
														response.response.answerJson && (
															<div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
																<p className='text-sm'>
																	Selected Option ID:{" "}
																	{String(
																		(
																			response.response.answerJson as {
																				selectedOptionId?: number;
																			}
																		).selectedOptionId || "None"
																	)}
																</p>
															</div>
														)}
													{question.type === "coding" &&
														response.response.answerJson && (
															<div className='p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700'>
																<pre className='text-xs font-mono whitespace-pre-wrap overflow-x-auto'>
																	{String(
																		(
																			response.response.answerJson as {
																				code?: string;
																			}
																		).code || "No code submitted"
																	)}
																</pre>
															</div>
														)}
													{question.type === "short" &&
														response.response.answerText && (
															<div className='p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700'>
																<p className='text-sm whitespace-pre-wrap'>
																	{response.response.answerText}
																</p>
															</div>
														)}
													{!response.response.answerText &&
														!response.response.answerJson && (
															<p className='text-sm text-gray-500 dark:text-gray-400 italic'>
																No answer provided
															</p>
														)}
												</div>
											</CardContent>
										</Card>
									);
								})}

								{/* Verification Artifacts Section */}
								{selectedAttempt.artifacts &&
									selectedAttempt.artifacts.length > 0 && (
										<Card className='shadow-lg border-2 border-primary'>
											<CardHeader className='bg-linear-to-r from-primary to-primary/80 text-white rounded-t-lg'>
												<CardTitle className='flex items-center gap-2'>
													<Image className='w-5 h-5' />
													Verification Artifacts
												</CardTitle>
												<CardDescription className='text-primary-foreground/80'>
													Captured face photo, room scan, and ID documents
												</CardDescription>
											</CardHeader>
											<CardContent className='pt-6'>
												<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
													{selectedAttempt.artifacts.map((artifact) => (
														<Card key={artifact.id} className='overflow-hidden'>
															<div className='aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative group'>
																{artifact.type === "face" && (
																	<img
																		src={artifact.url}
																		alt='Face verification'
																		className='w-full h-full object-cover'
																	/>
																)}
																{artifact.type === "room" && (
																	<video
																		src={artifact.url}
																		className='w-full h-full object-cover'
																		controls
																	/>
																)}
																{artifact.type === "id" && (
																	<img
																		src={artifact.url}
																		alt='ID document'
																		className='w-full h-full object-cover'
																	/>
																)}
															</div>
															<div className='p-3 border-t border-gray-200 dark:border-gray-700'>
																<div className='flex items-center justify-between mb-2'>
																	<div className='flex items-center gap-2'>
																		{artifact.type === "face" && (
																			<>
																				<Image className='w-4 h-4' />
																				<span className='text-sm font-medium'>
																					Face Photo
																				</span>
																			</>
																		)}
																		{artifact.type === "room" && (
																			<>
																				<Video className='w-4 h-4' />
																				<span className='text-sm font-medium'>
																					Room Scan
																				</span>
																			</>
																		)}
																		{artifact.type === "id" && (
																			<>
																				<FileText className='w-4 h-4' />
																				<span className='text-sm font-medium'>
																					ID Document
																				</span>
																			</>
																		)}
																	</div>
																</div>
																<p className='text-xs text-muted-foreground mb-3'>
																	{new Date(
																		artifact.createdAt
																	).toLocaleString()}
																</p>
																<Button
																	variant='outline'
																	size='sm'
																	asChild
																	className='w-full gap-1'
																>
																	<a
																		href={artifact.url}
																		target='_blank'
																		rel='noopener noreferrer'
																		download
																	>
																		<Download className='w-3 h-3' />
																		Download
																	</a>
																</Button>
															</div>
														</Card>
													))}
												</div>
											</CardContent>
										</Card>
									)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function Label({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<label className={`block text-sm font-medium ${className || ""}`}>
			{children}
		</label>
	);
}
