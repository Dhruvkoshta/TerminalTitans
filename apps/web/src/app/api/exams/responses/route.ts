import { NextRequest, NextResponse } from "next/server";
import { db, eq, inArray } from "@my-better-t-app/db";
import { attempts, responses, examQuestions, exams, verificationArtifacts } from "@my-better-t-app/db/schema/auth";

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

		// Optimize: Fetch all responses and artifacts in bulk instead of one by one
		const attemptIds = examAttempts.map(a => a.id);
		
		// Fetch all responses for all attempts at once
		const allResponses = attemptIds.length > 0 ? await db
			.select({
				response: responses,
				question: examQuestions,
			})
			.from(responses)
			.leftJoin(examQuestions, eq(responses.questionId, examQuestions.id))
			.where(inArray(responses.attemptId, attemptIds)) : [];

		// Fetch all artifacts for all attempts at once
		const allArtifacts = attemptIds.length > 0 ? await db
			.select()
			.from(verificationArtifacts)
			.where(inArray(verificationArtifacts.attemptId, attemptIds)) : [];

		// Group responses and artifacts by attemptId
		const responsesByAttempt = new Map<number, typeof allResponses>();
		const artifactsByAttempt = new Map<number, typeof allArtifacts>();

		allResponses.forEach(r => {
			const attemptId = r.response.attemptId;
			if (!responsesByAttempt.has(attemptId)) {
				responsesByAttempt.set(attemptId, []);
			}
			responsesByAttempt.get(attemptId)!.push(r);
		});

		allArtifacts.forEach(artifact => {
			const attemptId = artifact.attemptId;
			if (!artifactsByAttempt.has(attemptId)) {
				artifactsByAttempt.set(attemptId, []);
			}
			artifactsByAttempt.get(attemptId)!.push(artifact);
		});

		// Build the final result
		const attemptsWithResponses = examAttempts.map(attempt => ({
			...attempt,
			responses: responsesByAttempt.get(attempt.id) || [],
			artifacts: artifactsByAttempt.get(attempt.id) || [],
		}));

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
