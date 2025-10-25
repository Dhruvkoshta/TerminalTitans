import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@my-better-t-app/db";
import { attempts, responses, examQuestions, exams } from "@my-better-t-app/db/schema/auth";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const examId = searchParams.get("exam_id");

		if (!examId) {
			return NextResponse.json(
				{ error: "exam_id is required" },
				{ status: 400 }
			);
		}

		// Get all attempts for this exam
		const examAttempts = await db
			.select()
			.from(attempts)
			.where(eq(attempts.examId, Number(examId)));

		// Get exam details
		const examDetails = await db
			.select()
			.from(exams)
			.where(eq(exams.id, Number(examId)))
			.limit(1);

		if (examDetails.length === 0) {
			return NextResponse.json({ error: "Exam not found" }, { status: 404 });
		}

		// Get all questions for this exam
		const questions = await db
			.select()
			.from(examQuestions)
			.where(eq(examQuestions.examId, Number(examId)));

		// For each attempt, get all responses
		const attemptsWithResponses = await Promise.all(
			examAttempts.map(async (attempt) => {
				const studentResponses = await db
					.select({
						response: responses,
						question: examQuestions,
					})
					.from(responses)
					.leftJoin(examQuestions, eq(responses.questionId, examQuestions.id))
					.where(eq(responses.attemptId, attempt.id));

				return {
					...attempt,
					responses: studentResponses,
				};
			})
		);

		return NextResponse.json({
			exam: examDetails[0],
			questions,
			attempts: attemptsWithResponses,
		});
	} catch (error) {
		console.error("Error fetching exam responses:", error);
		return NextResponse.json(
			{ error: "Failed to fetch exam responses" },
			{ status: 500 }
		);
	}
}
