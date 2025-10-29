import { NextRequest, NextResponse } from "next/server";
import { db, eq, inArray } from "@my-better-t-app/db";
import { exams, logs, attempts } from "@my-better-t-app/db/schema/auth";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const studentEmail = searchParams.get("student_email");

		if (!studentEmail) {
			return NextResponse.json(
				{ error: "student_email is required" },
				{ status: 400 }
			);
		}

		// Fetch all published exams
		const allExams = await db.select().from(exams).where(eq(exams.status, "published"));

		// Optimize: Fetch all logs and attempts for this student in bulk
		const [studentLogs, studentAttempts] = await Promise.all([
			db.select().from(logs).where(eq(logs.studentEmail, studentEmail)),
			db.select().from(attempts).where(eq(attempts.studentId, studentEmail))
		]);

		// Create lookup maps for faster access
		const logsByExamCode = new Map<string, typeof studentLogs[0]>();
		studentLogs.forEach(log => {
			logsByExamCode.set(log.examCode, log);
		});

		const attemptsByExamId = new Map<number, typeof studentAttempts[0]>();
		studentAttempts.forEach(attempt => {
			attemptsByExamId.set(attempt.examId, attempt);
		});

		const now = new Date();
		const pastExams = [];
		const upcomingExams = [];
		const ongoingExams = [];

		for (const exam of allExams) {
			const start = new Date(exam.dateTimeStart);
			const end = new Date(start.getTime() + exam.duration * 60 * 1000);

			// Use lookup maps instead of array.find for better performance
			const hasAttempted = logsByExamCode.has(exam.examCode);
			const attempt = attemptsByExamId.get(exam.id);

			const examData = {
				...exam,
				hasAttempted,
				attempt,
				startTime: start,
				endTime: end,
			};

			if (now >= end) {
				pastExams.push(examData);
			} else if (now >= start && now < end) {
				ongoingExams.push(examData);
			} else {
				upcomingExams.push(examData);
			}
		}

		return NextResponse.json({
			pastExams,
			upcomingExams,
			ongoingExams,
		});
	} catch (error) {
		console.error("Error fetching student exams:", error);
		return NextResponse.json(
			{ error: "Failed to fetch exams" },
			{ status: 500 }
		);
	}
}
