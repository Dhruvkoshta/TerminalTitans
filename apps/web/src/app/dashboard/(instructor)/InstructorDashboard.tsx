"use client";

import React, { useReducer, useState, useMemo } from "react";
import {
	PlusIcon,
	TrashIcon,
	PencilSquareIcon,
	CheckIcon,
	XMarkIcon,
	ExclamationTriangleIcon,
	Cog6ToothIcon,
	DocumentPlusIcon,
	PhotoIcon,
} from "@heroicons/react/24/outline";
import { authClient } from "@/lib/auth-client";

type QuestionType = "mcq" | "coding" | "short";

type MCQOption = {
	id: string;
	text: string;
	isCorrect?: boolean;
};

type TestCase = {
	id: string;
	input: string;
	expectedOutput: string;
};

type Question = {
	id: string;
	title: string;
	prompt: string;
	type: QuestionType;
	points: number;
	options?: MCQOption[];
	language?: string;
	starterCode?: string;
	testCases?: TestCase[];
	createdAt: string;
};

type QuestionsState = { questions: Question[] };

type QuestionsAction =
	| { type: "add"; payload: Question }
	| { type: "update"; payload: Question }
	| { type: "delete"; payload: { id: string } }
	| { type: "replace"; payload: Question[] };

function questionsReducer(
	state: QuestionsState,
	action: QuestionsAction
): QuestionsState {
	switch (action.type) {
		case "add":
			return { questions: [...state.questions, action.payload] };
		case "update":
			return {
				questions: state.questions.map((q) =>
					q.id === action.payload.id ? action.payload : q
				),
			};
		case "delete":
			return {
				questions: state.questions.filter((q) => q.id !== action.payload.id),
			};
		case "replace":
			return { questions: action.payload };
		default:
			return state;
	}
}

const uid = (prefix = "") =>
	`${prefix}${Date.now().toString(36)}${Math.random()
		.toString(36)
		.slice(2, 7)}`;

const defaultQuestion = (type: QuestionType = "mcq"): Question => {
	const base: Question = {
		id: uid("q_"),
		title: "Untitled Question",
		prompt: "",
		type,
		points: 10,
		createdAt: new Date().toISOString(),
	};
	if (type === "mcq") {
		base.options = [
			{ id: uid("op_"), text: "Option A", isCorrect: true },
			{ id: uid("op_"), text: "Option B", isCorrect: false },
		];
	} else if (type === "coding") {
		base.language = "JavaScript";
		base.starterCode = "// starter code";
		base.testCases = [
			{ id: uid("tc_"), input: "input", expectedOutput: "output" },
		];
	}
	return base;
};

export default function ExamCreatorPage({
	session,
}: {
	session: typeof authClient.$Infer.Session;
}): React.ReactElement {
	const [state, dispatch] = useReducer(questionsReducer, { questions: [] });

	const [isModalOpen, setModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [draft, setDraft] = useState<Question>(() => defaultQuestion("mcq"));

	const [examTitle, setExamTitle] = useState<string>("Untitled Exam");
	const [course, setCourse] = useState<string>("");
	const [durationMin, setDurationMin] = useState<number>(60);
	const [startTime, setStartTime] = useState<string>("");
	const [endTime, setEndTime] = useState<string>("");

	const [enableAI, setEnableAI] = useState<boolean>(true);
	const [webcamMonitoring, setWebcamMonitoring] = useState<boolean>(true);
	const [micMonitoring, setMicMonitoring] = useState<boolean>(false);
	const [screenRecording, setScreenRecording] = useState<boolean>(false);
	const [browserLock, setBrowserLock] = useState<boolean>(true);
	const [copyPasteDisabled, setCopyPasteDisabled] = useState<boolean>(true);
	const [idVerification, setIdVerification] = useState<boolean>(false);

	const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(false);
	const [autoRelease, setAutoRelease] = useState<boolean>(false);
	const [allowMultipleAttempts, setAllowMultipleAttempts] =
		useState<boolean>(false);

	const questionCount = state.questions.length;
	const totalPoints = useMemo(
		() => state.questions.reduce((s, q) => s + (q.points ?? 0), 0),
		[state.questions]
	);

	function openNewQuestionModal(type: QuestionType = "mcq") {
		setDraft(defaultQuestion(type));
		setEditingId(null);
		setModalOpen(true);
	}

	function openEditQuestionModal(id: string) {
		const q = state.questions.find((x) => x.id === id);
		if (!q) return;
		setDraft(JSON.parse(JSON.stringify(q)));
		setEditingId(id);
		setModalOpen(true);
	}

	function saveQuestionFromDraft() {
		if (!draft.title?.trim()) {
			alert("Please add a question title");
			return;
		}
		if (draft.type === "mcq" && (!draft.options || draft.options.length < 2)) {
			alert("MCQ must have at least two options");
			return;
		}
		if (editingId) dispatch({ type: "update", payload: draft });
		else dispatch({ type: "add", payload: draft });
		setModalOpen(false);
	}

	function deleteQuestion(id: string) {
		if (!confirm("Delete this question?")) return;
		dispatch({ type: "delete", payload: { id } });
	}

	function updateDraft<K extends keyof Question>(key: K, value: Question[K]) {
		setDraft((d) => ({ ...d, [key]: value } as Question));
	}

	function addMCQOption() {
		if (!draft.options) draft.options = [];
		draft.options.push({
			id: uid("op_"),
			text: `Option ${String.fromCharCode(65 + draft.options.length)}`,
		});
		setDraft({ ...draft });
	}

	function updateOptionText(optionId: string, text: string) {
		if (!draft.options) return;
		draft.options = draft.options.map((o) =>
			o.id === optionId ? { ...o, text } : o
		);
		setDraft({ ...draft });
	}

	function setCorrectOption(optionId: string) {
		if (!draft.options) return;
		draft.options = draft.options.map((o) => ({
			...o,
			isCorrect: o.id === optionId,
		}));
		setDraft({ ...draft });
	}

	function removeOption(optionId: string) {
		if (!draft.options) return;
		draft.options = draft.options.filter((o) => o.id !== optionId);
		setDraft({ ...draft });
	}

	function addTestCase() {
		if (!draft.testCases) draft.testCases = [];
		draft.testCases.push({ id: uid("tc_"), input: "", expectedOutput: "" });
		setDraft({ ...draft });
	}

	function updateTestCase(
		tcId: string,
		field: "input" | "expectedOutput",
		value: string
	) {
		if (!draft.testCases) return;
		draft.testCases = draft.testCases.map((t) =>
			t.id === tcId ? { ...t, [field]: value } : t
		);
		setDraft({ ...draft });
	}

	function removeTestCase(tcId: string) {
		if (!draft.testCases) return;
		draft.testCases = draft.testCases.filter((t) => t.id !== tcId);
		setDraft({ ...draft });
	}

	function switchDraftType(type: QuestionType) {
		const base = {
			id: draft.id ?? uid("q_"),
			title: draft.title || "Untitled Question",
			prompt: draft.prompt || "",
			points: draft.points ?? 10,
			createdAt: draft.createdAt ?? new Date().toISOString(),
			type,
		} as Question;
		if (type === "mcq")
			base.options = draft.options ?? [
				{ id: uid("op_"), text: "Option A", isCorrect: true },
				{ id: uid("op_"), text: "Option B", isCorrect: false },
			];
		else if (type === "coding") {
			base.language = draft.language ?? "JavaScript";
			base.starterCode = draft.starterCode ?? "// starter code";
			base.testCases = draft.testCases ?? [
				{ id: uid("tc_"), input: "", expectedOutput: "" },
			];
		}
		setDraft(base);
	}

	function saveDraft() {
		const examPayload = exportExamPayload("draft");
		console.log("Saving draft:", examPayload);
		alert("Draft saved (console)");
	}

	function publishExam() {
		const examPayload = exportExamPayload("published");
		console.log("Publishing exam:", examPayload);
		alert("Exam published (console)");
	}

	function exportExamPayload(status: "draft" | "published") {
		return {
			title: examTitle,
			course,
			durationMin,
			startTime,
			endTime,
			status,
			meta: { shuffleQuestions, autoRelease, allowMultipleAttempts },
			proctoring: {
				enabled: enableAI,
				webcamMonitoring,
				micMonitoring,
				screenRecording,
				browserLock,
				copyPasteDisabled,
				idVerification,
			},
			questions: state.questions,
		};
	}

	function QuestionCard({ q, index }: { q: Question; index: number }) {
		return (
			<div className='flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm'>
				<div>
					<div className='flex items-center gap-3'>
						<div className='text-sm font-semibold'>Q{index + 1}:</div>
						<div className='text-sm text-slate-700 truncate max-w-md'>
							{q.title}
						</div>
						<span className='ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs bg-slate-100 text-slate-700'>
							{q.type === "mcq"
								? "MCQ"
								: q.type === "coding"
								? "Coding"
								: "Short"}
						</span>
						<span className='ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs bg-slate-50 text-slate-700'>
							{q.points} pts
						</span>
					</div>
					<div className='text-xs text-slate-500 mt-1'>
						{q.prompt
							? q.prompt.slice(0, 120) + (q.prompt.length > 120 ? "…" : "")
							: "No prompt yet"}
					</div>
				</div>

				<div className='flex items-center gap-2'>
					<button
						aria-label='Edit question'
						onClick={() => openEditQuestionModal(q.id)}
						className='inline-flex items-center gap-2 px-3 py-1 rounded text-slate-700 hover:bg-slate-50'
					>
						<PencilSquareIcon className='w-4 h-4' />
						<span className='text-sm'>Edit</span>
					</button>

					<button
						aria-label='Delete question'
						onClick={() => deleteQuestion(q.id)}
						className='inline-flex items-center gap-2 px-3 py-1 rounded text-red-600 hover:bg-red-50'
					>
						<TrashIcon className='w-4 h-4' />
						<span className='text-sm'>Delete</span>
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-slate-50 p-8 text-slate-800'>
			<div className='max-w-[1400px] mx-auto'>
				<div className='mb-6 flex items-center justify-between'>
					<div>
						<h1 className='text-2xl font-bold'>PROCTO — Exam Creator</h1>
						<p className='text-sm text-slate-600 mt-1'>
							Create exams, add questions, and configure AI proctoring rules.
						</p>
					</div>

					<div className='flex items-center gap-3'>
						<button
							onClick={saveDraft}
							className='inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border text-slate-700 hover:bg-slate-50 shadow-sm'
						>
							<DocumentPlusIcon className='w-4 h-4' />
							Save Draft
						</button>

						<button
							onClick={publishExam}
							className='inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-900 shadow'
						>
							<CheckIcon className='w-4 h-4' />
							Publish Exam
						</button>
					</div>
				</div>

				<div className='grid grid-cols-12 gap-6'>
					<div className='col-span-8'>
						<div className='mb-4 flex items-center gap-3'>
							<input
								className='flex-1 px-3 py-2 rounded-md border bg-white text-slate-800 shadow-sm'
								placeholder='Exam Title (e.g., Computer Science 101 Final)'
								value={examTitle}
								onChange={(e) => setExamTitle(e.target.value)}
							/>
							<div className='text-sm text-slate-600'>
								<div>{questionCount} questions</div>
								<div className='text-xs text-slate-500'>
									{totalPoints} total pts
								</div>
							</div>
						</div>

						<div className='space-y-3'>
							{state.questions.length === 0 ? (
								<div className='p-6 rounded-md border border-dashed border-slate-200 bg-white text-slate-600'>
									No questions yet. Click <strong>+ Add New Question</strong> to
									get started.
								</div>
							) : (
								<div className='space-y-3'>
									{state.questions.map((q, i) => (
										<QuestionCard key={q.id} q={q} index={i} />
									))}
								</div>
							)}

							<div className='mt-4'>
								<button
									onClick={() => openNewQuestionModal("mcq")}
									className='w-full p-4 rounded-lg border-2 border-dashed border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-3'
								>
									<PlusIcon className='w-5 h-5' />
									<span className='font-medium'>Add New Question</span>
								</button>

								<div className='mt-3 flex gap-2'>
									<button
										onClick={() => openNewQuestionModal("mcq")}
										className='flex-1 px-3 py-2 rounded-md bg-white border text-slate-700 hover:bg-slate-50'
									>
										+ MCQ
									</button>
									<button
										onClick={() => openNewQuestionModal("coding")}
										className='flex-1 px-3 py-2 rounded-md bg-white border text-slate-700 hover:bg-slate-50'
									>
										+ Coding
									</button>
									<button
										onClick={() => openNewQuestionModal("short")}
										className='flex-1 px-3 py-2 rounded-md bg-white border text-slate-700 hover:bg-slate-50'
									>
										+ Short Answer
									</button>
								</div>
							</div>
						</div>
					</div>

					<aside className='col-span-4'>
						<div className='sticky top-8 space-y-4'>
							<details
								open
								className='bg-white border rounded-md p-4 shadow-sm'
							>
								<summary className='flex items-center justify-between cursor-pointer'>
									<div className='flex items-center gap-2'>
										<Cog6ToothIcon className='w-5 h-5 text-slate-700' />
										<span className='font-semibold'>Exam Details</span>
									</div>
								</summary>

								<div className='mt-3 space-y-3'>
									<label className='block text-sm'>
										<div className='text-xs text-slate-600 mb-1'>Course</div>
										<input
											className='w-full px-3 py-2 rounded-md border bg-white'
											value={course}
											onChange={(e) => setCourse(e.target.value)}
										/>
									</label>
									<label className='block text-sm'>
										<div className='text-xs text-slate-600 mb-1'>
											Total Duration (minutes)
										</div>
										<input
											type='number'
											className='w-full px-3 py-2 rounded-md border bg-white'
											value={durationMin}
											onChange={(e) => setDurationMin(Number(e.target.value))}
										/>
									</label>
									<label className='block text-sm'>
										<div className='text-xs text-slate-600 mb-1'>
											Start Time
										</div>
										<input
											type='datetime-local'
											className='w-full px-3 py-2 rounded-md border bg-white'
											value={startTime}
											onChange={(e) => setStartTime(e.target.value)}
										/>
									</label>
									<label className='block text-sm'>
										<div className='text-xs text-slate-600 mb-1'>End Time</div>
										<input
											type='datetime-local'
											className='w-full px-3 py-2 rounded-md border bg-white'
											value={endTime}
											onChange={(e) => setEndTime(e.target.value)}
										/>
									</label>
								</div>
							</details>

							<details
								open
								className='bg-white border rounded-md p-4 shadow-sm'
							>
								<summary className='flex items-center justify-between cursor-pointer'>
									<div className='flex items-center gap-2'>
										<ExclamationTriangleIcon className='w-5 h-5 text-slate-700' />
										<span className='font-semibold'>AI Proctoring Rules</span>
									</div>
								</summary>

								<div className='mt-3 space-y-3 text-sm'>
									<label className='flex items-center gap-2'>
										<input
											type='checkbox'
											checked={enableAI}
											onChange={(e) => setEnableAI(e.target.checked)}
										/>
										<span>Enable AI Proctoring</span>
									</label>

									{enableAI && (
										<div className='pl-4 space-y-2'>
											<label className='flex items-center gap-2'>
												<input
													type='checkbox'
													checked={webcamMonitoring}
													onChange={(e) =>
														setWebcamMonitoring(e.target.checked)
													}
												/>
												<span>Webcam Monitoring</span>
											</label>
											<label className='flex items-center gap-2'>
												<input
													type='checkbox'
													checked={micMonitoring}
													onChange={(e) => setMicMonitoring(e.target.checked)}
												/>
												<span>Microphone Monitoring</span>
											</label>
											<label className='flex items-center gap-2'>
												<input
													type='checkbox'
													checked={screenRecording}
													onChange={(e) => setScreenRecording(e.target.checked)}
												/>
												<span>Screen Recording</span>
											</label>
											<label className='flex items-center gap-2'>
												<input
													type='checkbox'
													checked={browserLock}
													onChange={(e) => setBrowserLock(e.target.checked)}
												/>
												<span>Browser Lock</span>
											</label>
											<label className='flex items-center gap-2'>
												<input
													type='checkbox'
													checked={copyPasteDisabled}
													onChange={(e) =>
														setCopyPasteDisabled(e.target.checked)
													}
												/>
												<span>Copy/Paste Disabled</span>
											</label>
											<label className='flex items-center gap-2'>
												<input
													type='checkbox'
													checked={idVerification}
													onChange={(e) => setIdVerification(e.target.checked)}
												/>
												<span>ID Verification</span>
											</label>
										</div>
									)}
								</div>
							</details>

							<details className='bg-white border rounded-md p-4 shadow-sm'>
								<summary className='flex items-center justify-between cursor-pointer'>
									<div className='flex items-center gap-2'>
										<PhotoIcon className='w-5 h-5 text-slate-700' />
										<span className='font-semibold'>Grading & Access</span>
									</div>
								</summary>

								<div className='mt-3 space-y-2 text-sm'>
									<label className='flex items-center gap-2'>
										<input
											type='checkbox'
											checked={shuffleQuestions}
											onChange={(e) => setShuffleQuestions(e.target.checked)}
										/>
										<span>Shuffle Questions</span>
									</label>
									<label className='flex items-center gap-2'>
										<input
											type='checkbox'
											checked={autoRelease}
											onChange={(e) => setAutoRelease(e.target.checked)}
										/>
										<span>Auto-release results</span>
									</label>
									<label className='flex items-center gap-2'>
										<input
											type='checkbox'
											checked={allowMultipleAttempts}
											onChange={(e) =>
												setAllowMultipleAttempts(e.target.checked)
											}
										/>
										<span>Allow multiple attempts</span>
									</label>
								</div>
							</details>

							<div className='p-3 bg-white border rounded-md shadow-sm text-sm text-slate-600'>
								<div className='font-semibold'>Preview</div>
								<div className='mt-2'>
									Title: <span className='font-medium'>{examTitle}</span>
								</div>
								<div>
									Questions:{" "}
									<span className='font-medium'>{questionCount}</span>
								</div>
								<div>
									Total Points:{" "}
									<span className='font-medium'>{totalPoints}</span>
								</div>
							</div>
						</div>
					</aside>
				</div>
			</div>

			{isModalOpen && (
				<div className='fixed inset-0 z-50 flex items-start justify-center pt-16 px-4'>
					<div
						className='absolute inset-0 bg-black/40 backdrop-blur-sm'
						onClick={() => setModalOpen(false)}
					/>
					<div className='relative z-10 w-full max-w-5xl bg-white rounded-lg shadow-xl border'>
						<div className='flex items-center justify-between px-6 py-4 border-b'>
							<div className='flex items-center gap-3'>
								<h2 className='text-lg font-semibold'>
									{editingId ? "Edit Question" : "Create New Question"}
								</h2>
								<div className='text-sm text-slate-500'>
									{draft.type.toUpperCase()}
								</div>
							</div>

							<div className='flex items-center gap-2'>
								<select
									className='px-2 py-1 border rounded-md bg-white text-sm'
									value={draft.type}
									onChange={(e) =>
										switchDraftType(e.target.value as QuestionType)
									}
								>
									<option value='mcq'>Multiple Choice (MCQ)</option>
									<option value='coding'>Coding (Custom)</option>
									<option value='short'>Short Answer</option>
								</select>

								<button
									onClick={() => setModalOpen(false)}
									className='p-2 rounded hover:bg-slate-50'
								>
									<XMarkIcon className='w-5 h-5 text-slate-700' />
								</button>
							</div>
						</div>

						<div className='p-6 space-y-4 max-h-[70vh] overflow-auto'>
							<label className='block'>
								<div className='text-xs text-slate-600 mb-1'>
									Question Title
								</div>
								<input
									className='w-full px-3 py-2 border rounded-md'
									value={draft.title}
									onChange={(e) => updateDraft("title", e.target.value)}
								/>
							</label>

							<label className='block'>
								<div className='text-xs text-slate-600 mb-1'>
									Question Prompt (Markdown supported)
								</div>
								<textarea
									className='w-full px-3 py-2 border rounded-md min-h-[120px]'
									placeholder='Enter question prompt...'
									value={draft.prompt}
									onChange={(e) => updateDraft("prompt", e.target.value)}
								/>
							</label>

							<div className='grid grid-cols-2 gap-3'>
								<label className='block'>
									<div className='text-xs text-slate-600 mb-1'>Points</div>
									<input
										type='number'
										className='w-full px-3 py-2 border rounded-md'
										value={draft.points}
										onChange={(e) =>
											updateDraft("points", Number(e.target.value))
										}
									/>
								</label>
								<label className='block'>
									<div className='text-xs text-slate-600 mb-1'>Created At</div>
									<input
										className='w-full px-3 py-2 border rounded-md bg-slate-50'
										value={new Date(draft.createdAt).toLocaleString()}
										readOnly
									/>
								</label>
							</div>

							{draft.type === "mcq" && (
								<div className='border rounded-md p-3 bg-slate-50'>
									<div className='flex items-center justify-between mb-3'>
										<div className='font-semibold'>Manage Options</div>
										<button
											onClick={addMCQOption}
											className='text-sm text-slate-700 px-2 py-1 rounded hover:bg-slate-100 inline-flex items-center gap-2'
										>
											<PlusIcon className='w-4 h-4' />
											Add Option
										</button>
									</div>
									<div className='space-y-2'>
										{draft.options?.map((opt, idx) => (
											<div key={opt.id} className='flex items-center gap-2'>
												<input
													type='radio'
													name='mcq-correct'
													checked={!!opt.isCorrect}
													onChange={() => setCorrectOption(opt.id)}
													className='w-4 h-4'
												/>
												<input
													value={opt.text}
													onChange={(e) =>
														updateOptionText(opt.id, e.target.value)
													}
													className='flex-1 px-3 py-2 border rounded-md'
													placeholder={`Option ${String.fromCharCode(
														65 + idx
													)}`}
												/>
												<button
													onClick={() => removeOption(opt.id)}
													className='p-2 text-red-600 hover:bg-red-50 rounded'
												>
													<TrashIcon className='w-4 h-4' />
												</button>
											</div>
										))}
									</div>
								</div>
							)}

							{draft.type === "coding" && (
								<div className='border rounded-md p-3 bg-slate-50 space-y-3'>
									<div className='grid grid-cols-2 gap-3'>
										<label className='block'>
											<div className='text-xs text-slate-600 mb-1'>
												Language
											</div>
											<select
												className='w-full px-3 py-2 border rounded-md'
												value={draft.language}
												onChange={(e) =>
													updateDraft("language", e.target.value)
												}
											>
												<option>JavaScript</option>
												<option>TypeScript</option>
												<option>Python</option>
												<option>Java</option>
												<option>C++</option>
											</select>
										</label>
										<label className='block'>
											<div className='text-xs text-slate-600 mb-1'>Points</div>
											<input
												type='number'
												className='w-full px-3 py-2 border rounded-md'
												value={draft.points}
												onChange={(e) =>
													updateDraft("points", Number(e.target.value))
												}
											/>
										</label>
									</div>
									<label className='block'>
										<div className='text-xs text-slate-600 mb-1'>
											Starter Code
										</div>
										<textarea
											className='w-full px-3 py-2 border rounded-md min-h-[120px]'
											value={draft.starterCode}
											onChange={(e) =>
												updateDraft("starterCode", e.target.value)
											}
										/>
									</label>
									<div>
										<div className='flex items-center justify-between mb-2'>
											<div className='font-semibold text-sm'>
												Manage Test Cases
											</div>
											<button
												onClick={addTestCase}
												className='flex items-center gap-2 px-2 py-1 bg-white border rounded text-sm'
											>
												<PlusIcon className='w-4 h-4' />
												Add Test Case
											</button>
										</div>
										<div className='space-y-2'>
											{draft.testCases?.map((tc, idx) => (
												<div
													key={tc.id}
													className='p-2 bg-white border rounded'
												>
													<div className='text-xs text-slate-500 mb-2'>
														Test case #{idx + 1}
													</div>
													<textarea
														className='w-full px-2 py-1 border rounded mb-2'
														placeholder='Input'
														value={tc.input}
														onChange={(e) =>
															updateTestCase(tc.id, "input", e.target.value)
														}
													/>
													<textarea
														className='w-full px-2 py-1 border rounded'
														placeholder='Expected Output'
														value={tc.expectedOutput}
														onChange={(e) =>
															updateTestCase(
																tc.id,
																"expectedOutput",
																e.target.value
															)
														}
													/>
													<div className='mt-2 flex justify-end'>
														<button
															onClick={() => removeTestCase(tc.id)}
															className='text-red-600 text-sm px-2 py-1 rounded hover:bg-red-50 inline-flex items-center gap-2'
														>
															<TrashIcon className='w-4 h-4' />
															Remove
														</button>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							)}
						</div>

						<div className='flex items-center justify-end gap-3 px-6 py-4 border-t'>
							<button
								onClick={() => setModalOpen(false)}
								className='px-4 py-2 rounded-md bg-white border text-slate-700'
							>
								Cancel
							</button>
							<button
								onClick={saveQuestionFromDraft}
								className='px-4 py-2 rounded-md bg-slate-800 text-white'
							>
								Save Question
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
