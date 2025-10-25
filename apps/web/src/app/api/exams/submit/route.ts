import { NextRequest, NextResponse } from "next/server";
import { db, eq, and } from "@my-better-t-app/db";
import { attempts, responses, examQuestions, mcqOptions } from "@my-better-t-app/db/schema/auth";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			examId,
			studentId,
			studentEmail,
			answers,
			proctoringSummary,
		} = body;

		if (!examId || !studentId || !answers) {
			return NextResponse.json(
				{ error: "examId, studentId, and answers are required" },
				{ status: 400 }
			);
		}

		// Create attempt
		const attemptResult = await db
			.insert(attempts)
			.values({
				examId: Number(examId),
				studentId: studentEmail || studentId,
				submittedAt: new Date(),
				proctoringSummary: proctoringSummary || {},
			})
			.returning();

		const attempt = attemptResult[0];

		// Calculate score
		let totalScore = 0;
		let maxScore = 0;

		// Save all responses and calculate score
		for (const answer of answers) {
			const questionId = answer.questionId;
			const questionResult = await db
				.select()
				.from(examQuestions)
				.where(eq(examQuestions.id, questionId))
				.limit(1);

			if (questionResult.length === 0) continue;

			const question = questionResult[0];
			maxScore += question.points;

			let isCorrect = false;
			let awardedPoints = 0;

			// Check if answer is correct for MCQ
			if (question.type === "mcq" && answer.selectedOptionId) {
				const optionResult = await db
					.select()
					.from(mcqOptions)
					.where(
						and(
							eq(mcqOptions.id, answer.selectedOptionId),
							eq(mcqOptions.isCorrect, true)
						)
					)
					.limit(1);

				if (optionResult.length > 0) {
					isCorrect = true;
					awardedPoints = question.points;
					totalScore += awardedPoints;
				}
			}

			// For coding questions, store the code (manual grading needed)
			if (question.type === "coding") {
				// Coding questions need manual review or automated testing
				// For now, just store the answer
				awardedPoints = 0; // Will be graded later
			}

			// For short answer, store text (manual grading needed)
			if (question.type === "short") {
				awardedPoints = 0; // Will be graded later
			}

			// Save response
			await db.insert(responses).values({
				attemptId: attempt.id,
				questionId,
				answerText: answer.answerText || null,
				answerJson: answer.answerJson || {
					selectedOptionId: answer.selectedOptionId,
					code: answer.code,
				},
				isCorrect,
				awardedPoints,
			});
		}

		// Update attempt with score
		await db
			.update(attempts)
			.set({ score: totalScore })
			.where(eq(attempts.id, attempt.id));

		return NextResponse.json({
			success: true,
			attemptId: attempt.id,
			score: totalScore,
			maxScore,
			message: "Exam submitted successfully",
		});
	} catch (error) {
		console.error("Error submitting exam:", error);
		return NextResponse.json(
			{ error: "Failed to submit exam" },
			{ status: 500 }
		);
	}
}
