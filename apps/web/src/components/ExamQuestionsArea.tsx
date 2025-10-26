"use client";

import { useEffect, useState, useCallback, useReducer } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
	CheckCircle2,
	Circle,
	Code2,
	FileText,
	ChevronLeft,
	ChevronRight,
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

export default function ExamQuestionsArea({
	examCode,
	studentEmail,
	examId,
	onSubmitComplete,
}: {
	examCode: string;
	studentEmail: string;
	examId: string;
	onSubmitComplete?: () => void;
}) {
	const [examData, setExamData] = useState<ExamData | null>(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, dispatch] = useReducer(answersReducer, {});
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { theme } = useTheme();
	const router = useRouter();

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
			} catch (error) {
				console.error("Error fetching exam:", error);
				toast.error("Failed to load exam");
			} finally {
				setIsLoading(false);
			}
		};

		fetchExam();
	}, [examCode]);

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

			// Clear verification flag on successful submission
			if (examId && studentEmail) {
				const verificationKey = `verification_completed_${examId}_${studentEmail}`;
				sessionStorage.removeItem(verificationKey);
			}

			toast.success(
				`Exam submitted! Score: ${result.score}/${result.maxScore}`
			);

			if (onSubmitComplete) {
				onSubmitComplete();
			} else {
				router.push("/dashboard");
			}
		} catch (error) {
			console.error("Error submitting exam:", error);
			toast.error("Failed to submit exam. Please try again.");
			setIsSubmitting(false);
		}
	}, [
		answers,
		examData,
		examId,
		studentEmail,
		router,
		isSubmitting,
		onSubmitComplete,
	]);

	const currentQuestion = examData?.questions[currentQuestionIndex];
	const totalQuestions = examData?.questions.length || 0;

	if (isLoading) {
		return (
			<div className='h-[calc(100vh-200px)] flex items-center justify-center'>
				<div className='text-center'>
					<div className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
					<p className='text-muted-foreground'>Loading exam...</p>
				</div>
			</div>
		);
	}

	if (!examData || !currentQuestion) {
		return (
			<div className='h-[calc(100vh-200px)] flex items-center justify-center'>
				<div className='text-center text-muted-foreground'>
					<AlertCircle className='w-16 h-16 mx-auto mb-4' />
					<p className='text-xl mb-2'>Exam Not Found</p>
					<p className='text-sm'>
						Unable to load the exam. Please check the exam code and try again.
					</p>
				</div>
			</div>
		);
	}

	// LeetCode-style layout for coding questions
	const isCodingQuestion = currentQuestion.type === "coding";

	return (
		<div className='h-[calc(100vh-200px)] flex flex-col'>
			{/* Header - always show */}
			<div className='shrink-0 bg-linear-to-r from-primary to-accent text-background p-4 rounded-t-lg'>
				<div className='flex items-start justify-between'>
					<div className='flex-1'>
						<h3 className='text-xl font-bold mb-1 flex items-center gap-2'>
							{currentQuestion.type === "mcq" && (
								<CheckCircle2 className='w-5 h-5' />
							)}
							{currentQuestion.type === "coding" && (
								<Code2 className='w-5 h-5' />
							)}
							{currentQuestion.type === "short" && (
								<FileText className='w-5 h-5' />
							)}
							Question {currentQuestionIndex + 1}: {currentQuestion.title}
						</h3>
						<p className='text-primary-foreground/80 text-sm'>
							{currentQuestion.type === "mcq" && "Multiple Choice Question"}
							{currentQuestion.type === "coding" && "Coding Question"}
							{currentQuestion.type === "short" && "Short Answer"}
						</p>
					</div>
					<div className='bg-background/20 px-3 py-1 rounded-lg'>
						<p className='text-sm font-semibold'>
							{currentQuestion.points} points
						</p>
					</div>
				</div>
			</div>

			{/* Content Area - Split for coding, Full for others */}
			{isCodingQuestion ? (
				<div className='flex-1 flex gap-0 overflow-hidden'>
					{/* Left Panel - Question Description */}
					<div className='flex-1 bg-card overflow-y-auto border-r border-border'>
						<div className='p-4 space-y-4'>
							{/* Question Prompt */}
							<div>
								<h4 className='text-sm font-semibold text-foreground mb-2'>
									Description
								</h4>
								<div className='p-3 bg-secondary rounded-lg border border-border'>
									<p className='text-foreground whitespace-pre-wrap leading-relaxed text-sm'>
										{currentQuestion.prompt}
									</p>
								</div>
							</div>

							{/* Test Cases */}
							{currentQuestion.testCases &&
								currentQuestion.testCases.length > 0 && (
									<div>
										<h4 className='text-sm font-semibold text-foreground mb-2'>
											Test Cases
										</h4>
										<div className='space-y-2'>
											{currentQuestion.testCases.map((testCase, idx) => (
												<div
													key={testCase.id}
													className='p-3 bg-secondary rounded-lg border border-border'
												>
													<p className='text-xs font-medium text-muted-foreground mb-2'>
														Example {idx + 1}
													</p>
													<div className='space-y-1 text-xs'>
														<div>
															<span className='text-muted-foreground font-medium'>
																Input:
															</span>
															<code className='block mt-1 p-2 bg-background rounded border border-border font-mono text-foreground'>
																{testCase.input}
															</code>
														</div>
														<div>
															<span className='text-muted-foreground font-medium'>
																Output:
															</span>
															<code className='block mt-1 p-2 bg-background rounded border border-border font-mono text-foreground'>
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
					</div>

					{/* Right Panel - Code Editor */}
					<div className='flex-1 bg-background flex flex-col'>
						<div className='shrink-0 px-4 py-3 border-b border-border bg-card'>
							<Label className='text-sm font-semibold text-foreground'>
								Solution
							</Label>
						</div>
						<div className='flex-1 overflow-hidden'>
							<Editor
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
									fontSize: 13,
									lineNumbers: "on",
									scrollBeyondLastLine: false,
									automaticLayout: true,
									padding: { top: 16, bottom: 16 },
									wordWrap: "on",
								}}
							/>
						</div>
					</div>
				</div>
			) : (
				<div className='flex-1 overflow-y-auto bg-card p-4'>
					{/* Question Prompt */}
					<div className='mb-4 p-3 bg-secondary rounded-lg border border-border'>
						<p className='text-foreground whitespace-pre-wrap leading-relaxed'>
							{currentQuestion.prompt}
						</p>
					</div>

					{/* Answer Area */}
					{currentQuestion.type === "mcq" && currentQuestion.options && (
						<div className='space-y-2'>
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
										className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
											isSelected
												? "border-primary bg-primary/10 shadow-md"
												: "border-border hover:border-primary bg-secondary"
										}`}
									>
										<div className='flex items-center gap-3'>
											{isSelected ? (
												<CheckCircle2 className='w-5 h-5 text-primary shrink-0' />
											) : (
												<Circle className='w-5 h-5 text-muted-foreground shrink-0' />
											)}
											<span className='text-foreground'>{option.text}</span>
										</div>
									</button>
								);
							})}
						</div>
					)}

					{currentQuestion.type === "short" && (
						<div>
							<Label className='text-sm font-semibold mb-2 block text-foreground'>
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
								className='w-full min-h-[200px] p-3 border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground resize-y'
								placeholder='Type your answer here...'
							/>
						</div>
					)}
				</div>
			)}

			{/* Navigation */}
			<div className='shrink-0 bg-card rounded-lg p-3 space-y-3'>
				<div className='flex gap-2 flex-wrap justify-center'>
					{examData.questions.map((_, idx) => (
						<button
							key={idx}
							onClick={() => setCurrentQuestionIndex(idx)}
							className={`w-9 h-9 rounded-lg font-semibold text-sm transition-all ${
								idx === currentQuestionIndex
									? "bg-primary text-primary-foreground shadow-lg scale-110"
									: answers[examData.questions[idx].id]
									? "bg-green-600 text-white border-2 border-green-500"
									: "bg-secondary text-secondary-foreground hover:bg-secondary/80"
							}`}
						>
							{idx + 1}
						</button>
					))}
				</div>

				<div className='flex items-center justify-between'>
					<Button
						onClick={() =>
							setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
						}
						disabled={currentQuestionIndex === 0}
						variant='outline'
						size='sm'
						className='bg-secondary border-border hover:bg-secondary/80'
					>
						<ChevronLeft className='w-4 h-4 mr-1' />
						Previous
					</Button>

					<Button
						onClick={handleSubmit}
						disabled={isSubmitting}
						size='sm'
						className='bg-green-600 hover:bg-green-700 text-white'
					>
						Submit Exam
					</Button>

					<Button
						onClick={() =>
							setCurrentQuestionIndex((prev) =>
								Math.min(totalQuestions - 1, prev + 1)
							)
						}
						disabled={currentQuestionIndex === totalQuestions - 1}
						variant='outline'
						size='sm'
						className='bg-secondary border-border hover:bg-secondary/80'
					>
						Next
						<ChevronRight className='w-4 h-4 ml-1' />
					</Button>
				</div>
			</div>
		</div>
	);
}
