"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
	Calendar,
	Clock,
	CheckCircle2,
	AlertCircle,
	PlayCircle,
	Code,
} from "lucide-react";

type Exam = {
	id: number;
	name: string;
	profEmail: string;
	examLink: string;
	dateTimeStart: string;
	duration: number;
	examCode: string;
	status: string;
	hasAttempted: boolean;
	startTime: string;
	endTime: string;
	attempt?: any;
};

type ExamsData = {
	pastExams: Exam[];
	upcomingExams: Exam[];
	ongoingExams: Exam[];
};

export default function StudentDashboard({
	session,
}: {
	session: typeof authClient.$Infer.Session;
}) {
	const [examCode, setExamCode] = useState("");
	const [status, setStatus] = useState<string>("");
	const [examsData, setExamsData] = useState<ExamsData>({
		pastExams: [],
		upcomingExams: [],
		ongoingExams: [],
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchExams();
	}, [session.user?.email]);

	async function fetchExams() {
		if (!session.user?.email) return;

		try {
			const res = await fetch(
				`/api/exams/studentExams?student_email=${encodeURIComponent(
					session.user.email
				)}`
			);
			if (res.ok) {
				const data = await res.json();
				setExamsData(data);
			}
		} catch (error) {
			console.error("Failed to fetch exams:", error);
		} finally {
			setLoading(false);
		}
	}

	async function startExam() {
		try {
			const res = await fetch(
				`/api/exams/examByCode?exam_code=${encodeURIComponent(examCode)}`
			);
			const data = await res.json();
			if (!res.ok) {
				setStatus("Exam code is invalid");
				return;
			}
			const start = new Date(data.date_time_start ?? data.dateTimeStart);
			const duration = Number(data.duration);
			const end = new Date(start.getTime() + duration * 60 * 1000);
			const now = new Date();
			if (now >= start && now < end) {
				const diff = end.getTime() - now.getTime();
				const diff_mins = Math.floor(diff / 60000);
				const diff_secs = Math.floor((diff % 60000) / 1000);
				setStatus("Starting exam");
				const search = new URLSearchParams({
					mins_left: String(diff_mins),
					secs_left: String(diff_secs),
				});
				window.location.href = `/exam/${encodeURIComponent(
					examCode
				)}?${search.toString()}`;
			} else if (now >= end) {
				setStatus("Exam has already ended");
			} else {
				setStatus("Exam has not started now");
			}
		} catch (e) {
			setStatus("Exam code is invalid");
		}
	}

	function formatDateTime(dateStr: string) {
		const date = new Date(dateStr);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	function startExamById(exam: Exam) {
		const start = new Date(exam.startTime);
		const end = new Date(exam.endTime);
		const now = new Date();

		if (now >= start && now < end) {
			const diff = end.getTime() - now.getTime();
			const diff_mins = Math.floor(diff / 60000);
			const diff_secs = Math.floor((diff % 60000) / 1000);
			const search = new URLSearchParams({
				mins_left: String(diff_mins),
				secs_left: String(diff_secs),
			});
			window.location.href = `/exam/${encodeURIComponent(
				exam.examCode
			)}?${search.toString()}`;
		}
	}

	return (
		<div className='space-y-8 max-w-7xl mx-auto'>
			{/* Welcome Header */}
			<div className='space-y-2'>
				<h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
					Welcome back, {session.user?.name?.split(" ")[0]}! 👋
				</h1>
				<p className='text-lg text-muted-foreground'>
					Ready to take your exams? Enter a code or browse your scheduled exams
					below.
				</p>
			</div>

			{/* Quick Start Exam Card */}
			<Card className='border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950'>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Code className='w-5 h-5' />
						Quick Start Exam
					</CardTitle>
					<CardDescription>
						Have an exam code? Enter it here to start immediately.
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='flex gap-4'>
						<div className='flex-1 space-y-2'>
							<Label htmlFor='exam-code'>Exam Code</Label>
							<Input
								id='exam-code'
								placeholder='Enter 6-digit code'
								value={examCode}
								onChange={(e) => setExamCode(e.target.value.toUpperCase())}
								className='font-mono text-lg'
							/>
						</div>
						<div className='flex items-end'>
							<Button
								onClick={startExam}
								disabled={!examCode}
								size='lg'
								className='gap-2'
							>
								<PlayCircle className='w-4 h-4' />
								Start Exam
							</Button>
						</div>
					</div>
					{status && (
						<p className='text-sm text-destructive flex items-center gap-1'>
							<AlertCircle className='w-4 h-4' />
							{status}
						</p>
					)}
				</CardContent>
			</Card>

			{/* Ongoing Exams */}
			{examsData.ongoingExams.length > 0 && (
				<div className='space-y-4'>
					<h2 className='text-2xl font-semibold flex items-center gap-2'>
						<PlayCircle className='w-6 h-6 text-green-500' />
						Active Exams
					</h2>
					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
						{examsData.ongoingExams.map((exam) => (
							<Card
								key={exam.id}
								className='border-2 border-green-500 bg-green-50 dark:bg-green-950/20 hover:shadow-lg transition-shadow'
							>
								<CardHeader>
									<CardTitle className='text-lg'>{exam.name}</CardTitle>
									<CardDescription className='flex items-center gap-1'>
										<Calendar className='w-3 h-3' />
										{formatDateTime(exam.startTime)}
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-3'>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>Duration:</span>
										<span className='font-medium flex items-center gap-1'>
											<Clock className='w-3 h-3' />
											{exam.duration} mins
										</span>
									</div>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>Code:</span>
										<span className='font-mono font-bold'>{exam.examCode}</span>
									</div>
									<div className='pt-2'>
										<Button
											onClick={() => startExamById(exam)}
											className='w-full gap-2 bg-green-600 hover:bg-green-700'
											size='sm'
										>
											<PlayCircle className='w-4 h-4' />
											Join Now
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}

			{/* Upcoming Exams */}
			{examsData.upcomingExams.length > 0 && (
				<div className='space-y-4'>
					<h2 className='text-2xl font-semibold flex items-center gap-2'>
						<Calendar className='w-6 h-6 text-blue-500' />
						Upcoming Exams
					</h2>
					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
						{examsData.upcomingExams.map((exam) => (
							<Card
								key={exam.id}
								className='border-2 border-blue-200 hover:shadow-lg transition-shadow'
							>
								<CardHeader>
									<CardTitle className='text-lg'>{exam.name}</CardTitle>
									<CardDescription className='flex items-center gap-1'>
										<Calendar className='w-3 h-3' />
										{formatDateTime(exam.startTime)}
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-3'>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>Duration:</span>
										<span className='font-medium flex items-center gap-1'>
											<Clock className='w-3 h-3' />
											{exam.duration} mins
										</span>
									</div>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>Code:</span>
										<span className='font-mono font-bold'>{exam.examCode}</span>
									</div>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>Status:</span>
										<span className='px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium'>
											Scheduled
										</span>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}

			{/* Past Exams */}
			{examsData.pastExams.length > 0 && (
				<div className='space-y-4'>
					<h2 className='text-2xl font-semibold flex items-center gap-2'>
						<CheckCircle2 className='w-6 h-6 text-gray-500' />
						Past Exams
					</h2>
					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
						{examsData.pastExams.map((exam) => (
							<Card
								key={exam.id}
								className='border border-gray-200 hover:shadow-lg transition-shadow opacity-80'
							>
								<CardHeader>
									<CardTitle className='text-lg'>{exam.name}</CardTitle>
									<CardDescription className='flex items-center gap-1'>
										<Calendar className='w-3 h-3' />
										{formatDateTime(exam.startTime)}
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-3'>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>Duration:</span>
										<span className='font-medium flex items-center gap-1'>
											<Clock className='w-3 h-3' />
											{exam.duration} mins
										</span>
									</div>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>Code:</span>
										<span className='font-mono font-bold'>{exam.examCode}</span>
									</div>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>Status:</span>
										{exam.hasAttempted ? (
											<span className='px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs font-medium flex items-center gap-1'>
												<CheckCircle2 className='w-3 h-3' />
												Completed
											</span>
										) : (
											<span className='px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded text-xs font-medium'>
												Not Attempted
											</span>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}

			{/* Empty State */}
			{!loading &&
				examsData.ongoingExams.length === 0 &&
				examsData.upcomingExams.length === 0 &&
				examsData.pastExams.length === 0 && (
					<Card className='py-12 text-center'>
						<CardContent>
							<Calendar className='w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50' />
							<h3 className='text-xl font-semibold mb-2'>No Exams Found</h3>
							<p className='text-muted-foreground mb-4'>
								You don't have any scheduled exams at the moment.
							</p>
							<p className='text-sm text-muted-foreground'>
								Enter an exam code above to start an exam manually.
							</p>
						</CardContent>
					</Card>
				)}

			{loading && (
				<div className='flex justify-center py-12'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
				</div>
			)}
		</div>
	);
}
