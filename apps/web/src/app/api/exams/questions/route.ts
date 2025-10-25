import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@my-better-t-app/db";
import { exams, examQuestions, mcqOptions, codingTestCases } from "@my-better-t-app/db/schema/auth";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const examCode = searchParams.get("exam_code");

		if (!examCode) {
			return NextResponse.json(
				{ error: "exam_code is required" },
				{ status: 400 }
			);
		}

		// Get exam
		const examResult = await db
			.select()
			.from(exams)
			.where(eq(exams.examCode, examCode))
			.limit(1);

		if (examResult.length === 0) {
			return NextResponse.json({ error: "Exam not found" }, { status: 404 });
		}

		const exam = examResult[0];

		// Get all questions for this exam
		const questions = await db
			.select()
			.from(examQuestions)
			.where(eq(examQuestions.examId, exam.id));

		// Get options and test cases for each question
		const questionsWithDetails = await Promise.all(
			questions.map(async (question) => {
				let options = null;
				let testCases = null;

				if (question.type === "mcq") {
					options = await db
						.select({
							id: mcqOptions.id,
							text: mcqOptions.text,
						})
						.from(mcqOptions)
						.where(eq(mcqOptions.questionId, question.id));
				}

				if (question.type === "coding") {
					testCases = await db
						.select()
						.from(codingTestCases)
						.where(eq(codingTestCases.questionId, question.id));
				}

				return {
					...question,
					options,
					testCases,
				};
			})
		);

		return NextResponse.json({
			exam,
			questions: questionsWithDetails,
		});
	} catch (error) {
		console.error("Error fetching exam questions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch questions" },
			{ status: 500 }
		);
	}
}
