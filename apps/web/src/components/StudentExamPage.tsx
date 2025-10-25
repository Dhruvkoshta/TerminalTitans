"use client";

import { useEffect, useState, useCallback, useReducer } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
	CheckCircle2,
	Circle,
	Code2,
	FileText,
	ChevronLeft,
	ChevronRight,
	Send,
	Clock,
	AlertCircle,
} from "lucide-react";
import { useTheme } from "next-themes";

interface MCQOption {
	id: number;
	text: string;
}

interface CodingTestCase {
	id: number;
	input: string;
	expectedOutput: string;
}

interface Question {
	id: number;
	type: "mcq" | "coding" | "short";
	title: string;
	prompt: string;
	points: number;
	options?: MCQOption[];
	testCases?: CodingTestCase[];
}

interface ExamData {
	id: number;
	name: string;
	duration: number;
	questions: Question[];
}

type Answer = {
	questionId: number;
	selectedOptionId?: number;
	code?: string;
	answerText?: string;
	answerJson?: Record<string, unknown>;
};

type AnswersState = Record<number, Answer>;

type AnswerAction =
	| { type: "SET_MCQ"; questionId: number; optionId: number }
	| { type: "SET_CODE"; questionId: number; code: string }
	| { type: "SET_TEXT"; questionId: number; text: string }
	| { type: "RESET" };

function answersReducer(
	state: AnswersState,
	action: AnswerAction
): AnswersState {
	switch (action.type) {
		case "SET_MCQ":
			return {
				...state,
				[action.questionId]: {
					questionId: action.questionId,
					selectedOptionId: action.optionId,
				},
			};
		case "SET_CODE":
			return {
				...state,
				[action.questionId]: {
					questionId: action.questionId,
					code: action.code,
				},
			};
		case "SET_TEXT":
			return {
				...state,
				[action.questionId]: {
					questionId: action.questionId,
					answerText: action.text,
				},
			};
		case "RESET":
			return {};
		default:
			return state;
	}
}

export default function StudentExamPage({
	examCode,
	studentEmail,
	examId,
	onViolation,
}: {
	examCode: string;
	studentEmail: string;
	examId: string;
	onViolation?: () => void;
}) {
	const [examData, setExamData] = useState<ExamData | null>(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, dispatch] = useReducer(answersReducer, {});
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [timeRemaining, setTimeRemaining] = useState(0);
	const router = useRouter();
	const { theme } = useTheme();

	useEffect(() => {
		const fetchExam = async () => {
			try {
				const response = await fetch(
					`/api/exams/questions?exam_code=${examCode}`
				);
				if (!response.ok) {
					throw new Error("Failed to fetch exam");
				}
				const data = await response.json();
				setExamData(data);
				setTimeRemaining(data.duration * 60); // Convert minutes to seconds
			} catch (error) {
				console.error("Error fetching exam:", error);
				toast.error("Failed to load exam");
			} finally {
				setIsLoading(false);
			}
		};

		fetchExam();
	}, [examCode]);

	// Timer
	useEffect(() => {
		if (timeRemaining <= 0) {
			handleSubmit();
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
		}, 1000);

		return () => clearInterval(timer);
	}, [timeRemaining]);

	const formatTime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	const handleSubmit = useCallback(async () => {
		if (isSubmitting) return;

		const unansweredCount =
			examData?.questions.filter((q) => !answers[q.id]).length || 0;

		if (unansweredCount > 0) {
			const confirmed = confirm(
				`You have ${unansweredCount} unanswered questions. Do you want to submit anyway?`
			);
			if (!confirmed) return;
		}

		setIsSubmitting(true);

		try {
			const answersArray = Object.values(answers);
			const response = await fetch("/api/exams/submit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					examId,
					studentId: studentEmail,
					studentEmail,
					answers: answersArray,
					proctoringSummary: {},
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to submit exam");
			}

			const result = await response.json();
			toast.success(
				`Exam submitted! Score: ${result.score}/${result.maxScore}`
			);
			router.push("/dashboard");
		} catch (error) {
			console.error("Error submitting exam:", error);
			toast.error("Failed to submit exam. Please try again.");
			setIsSubmitting(false);
		}
	}, [answers, examData, examId, studentEmail, router, isSubmitting]);

	const currentQuestion = examData?.questions[currentQuestionIndex];
	const totalQuestions = examData?.questions.length || 0;

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
				<div className='text-center'>
					<div className='w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
					<p className='text-gray-600 dark:text-gray-400'>Loading exam...</p>
				</div>
			</div>
		);
	}

	if (!examData || !currentQuestion) {
		return (
			<div className='flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
				<Card className='max-w-md w-full'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2 text-red-600'>
							<AlertCircle className='w-6 h-6' />
							Exam Not Found
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-gray-600 dark:text-gray-400 mb-4'>
							Unable to load the exam. Please check the exam code and try again.
						</p>
						<Button
							onClick={() => router.push("/dashboard")}
							className='w-full'
						>
							Return to Dashboard
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6'>
			<div className='max-w-5xl mx-auto'>
				{/* Header */}
				<div className='mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6'>
					<div className='flex items-center justify-between flex-wrap gap-4'>
						<div>
							<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
								{examData.name}
							</h1>
							<p className='text-gray-600 dark:text-gray-400 mt-1'>
								Question {currentQuestionIndex + 1} of {totalQuestions}
							</p>
						</div>
						<div className='flex items-center gap-4'>
							<div className='flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
								<Clock className='w-5 h-5 text-blue-600 dark:text-blue-400' />
								<span className='font-mono text-lg font-semibold text-blue-600 dark:text-blue-400'>
									{formatTime(timeRemaining)}
								</span>
							</div>
							<Button
								onClick={handleSubmit}
								disabled={isSubmitting}
								size='lg'
								className='bg-green-600 hover:bg-green-700 text-white'
							>
								<Send className='w-5 h-5 mr-2' />
								Submit Exam
							</Button>
						</div>
					</div>
				</div>

				{/* Question Card */}
				<Card className='mb-6 shadow-xl'>
					<CardHeader className='bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-t-lg'>
						<div className='flex items-start justify-between'>
							<div className='flex-1'>
								<CardTitle className='text-2xl mb-2 flex items-center gap-2'>
									{currentQuestion.type === "mcq" && (
										<CheckCircle2 className='w-6 h-6' />
									)}
									{currentQuestion.type === "coding" && (
										<Code2 className='w-6 h-6' />
									)}
									{currentQuestion.type === "short" && (
										<FileText className='w-6 h-6' />
									)}
									{currentQuestion.title}
								</CardTitle>
								<CardDescription className='text-blue-100'>
									{currentQuestion.type === "mcq" && "Multiple Choice Question"}
									{currentQuestion.type === "coding" && "Coding Question"}
									{currentQuestion.type === "short" && "Short Answer"}
								</CardDescription>
							</div>
							<div className='bg-white/20 px-4 py-2 rounded-lg'>
								<p className='text-sm font-semibold'>
									{currentQuestion.points} points
								</p>
							</div>
						</div>
					</CardHeader>
					<CardContent className='p-6'>
						{/* Question Prompt */}
						<div className='mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700'>
							<p className='text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed'>
								{currentQuestion.prompt}
							</p>
						</div>

						{/* Answer Area */}
						{currentQuestion.type === "mcq" && currentQuestion.options && (
							<div className='space-y-3'>
								{currentQuestion.options.map((option) => {
									const isSelected =
										answers[currentQuestion.id]?.selectedOptionId === option.id;
									return (
										<button
											key={option.id}
											onClick={() =>
												dispatch({
													type: "SET_MCQ",
													questionId: currentQuestion.id,
													optionId: option.id,
												})
											}
											className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
												isSelected
													? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
													: "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-800"
											}`}
										>
											<div className='flex items-center gap-3'>
												{isSelected ? (
													<CheckCircle2 className='w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0' />
												) : (
													<Circle className='w-6 h-6 text-gray-400 shrink-0' />
												)}
												<span className='text-gray-800 dark:text-gray-200'>
													{option.text}
												</span>
											</div>
										</button>
									);
								})}
							</div>
						)}

						{currentQuestion.type === "coding" && (
							<div className='space-y-4'>
								<div>
									<Label className='text-base font-semibold mb-2 block'>
										Your Code
									</Label>
									<div className='border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden'>
										<Editor
											height='400px'
											defaultLanguage='python'
											theme={theme === "dark" ? "vs-dark" : "light"}
											value={answers[currentQuestion.id]?.code || ""}
											onChange={(value) =>
												dispatch({
													type: "SET_CODE",
													questionId: currentQuestion.id,
													code: value || "",
												})
											}
											options={{
												minimap: { enabled: false },
												fontSize: 14,
												lineNumbers: "on",
												scrollBeyondLastLine: false,
												automaticLayout: true,
											}}
										/>
									</div>
								</div>

								{currentQuestion.testCases &&
									currentQuestion.testCases.length > 0 && (
										<div className='mt-4'>
											<Label className='text-base font-semibold mb-2 block'>
												Test Cases (for reference)
											</Label>
											<div className='space-y-2'>
												{currentQuestion.testCases.map((testCase, idx) => (
													<div
														key={testCase.id}
														className='p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700'
													>
														<p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
															Test Case {idx + 1}
														</p>
														<div className='grid grid-cols-2 gap-3 text-xs'>
															<div>
																<span className='text-gray-500 dark:text-gray-400'>
																	Input:
																</span>
																<code className='block mt-1 p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 font-mono'>
																	{testCase.input}
																</code>
															</div>
															<div>
																<span className='text-gray-500 dark:text-gray-400'>
																	Expected Output:
																</span>
																<code className='block mt-1 p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 font-mono'>
																	{testCase.expectedOutput}
																</code>
															</div>
														</div>
													</div>
												))}
											</div>
										</div>
									)}
							</div>
						)}

						{currentQuestion.type === "short" && (
							<div>
								<Label className='text-base font-semibold mb-2 block'>
									Your Answer
								</Label>
								<textarea
									value={answers[currentQuestion.id]?.answerText || ""}
									onChange={(e) =>
										dispatch({
											type: "SET_TEXT",
											questionId: currentQuestion.id,
											text: e.target.value,
										})
									}
									className='w-full min-h-[200px] p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y'
									placeholder='Type your answer here...'
								/>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Navigation */}
				<div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4'>
					<Button
						onClick={() =>
							setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
						}
						disabled={currentQuestionIndex === 0}
						variant='outline'
						size='lg'
					>
						<ChevronLeft className='w-5 h-5 mr-2' />
						Previous
					</Button>

					<div className='flex gap-2 flex-wrap justify-center'>
						{examData.questions.map((_, idx) => (
							<button
								key={idx}
								onClick={() => setCurrentQuestionIndex(idx)}
								className={`w-10 h-10 rounded-lg font-semibold transition-all ${
									idx === currentQuestionIndex
										? "bg-blue-600 text-white shadow-lg scale-110"
										: answers[examData.questions[idx].id]
										? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-700"
										: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
								}`}
							>
								{idx + 1}
							</button>
						))}
					</div>

					<Button
						onClick={() =>
							setCurrentQuestionIndex((prev) =>
								Math.min(totalQuestions - 1, prev + 1)
							)
						}
						disabled={currentQuestionIndex === totalQuestions - 1}
						variant='outline'
						size='lg'
					>
						Next
						<ChevronRight className='w-5 h-5 ml-2' />
					</Button>
				</div>
			</div>
		</div>
	);
}
