import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@my-better-t-app/db";
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

		// Fetch all exams
		const allExams = await db.select().from(exams).where(eq(exams.status, "published"));

		// Get logs for this student
		const studentLogs = await db
			.select()
			.from(logs)
			.where(eq(logs.studentEmail, studentEmail));

		// Get attempts for this student
		const studentAttempts = await db
			.select()
			.from(attempts)
			.where(eq(attempts.studentId, studentEmail));

		const now = new Date();
		const pastExams = [];
		const upcomingExams = [];
		const ongoingExams = [];

		for (const exam of allExams) {
			const start = new Date(exam.dateTimeStart);
			const end = new Date(start.getTime() + exam.duration * 60 * 1000);

			// Check if student has logs for this exam
			const hasAttempted = studentLogs.some((log) => log.examCode === exam.examCode);
			const attempt = studentAttempts.find((att) => att.examId === exam.id);

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
