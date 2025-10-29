import { db, eq, and, inArray } from "@my-better-t-app/db";
import { attempts, verificationArtifacts, exams } from "@my-better-t-app/db/schema/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/instructor/exams/[examId]/attempts
 * Fetch all attempts for an exam with verification artifacts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const examIdNum = parseInt(examId, 10);

    if (isNaN(examIdNum)) {
      return NextResponse.json(
        { message: "Invalid exam ID" },
        { status: 400 }
      );
    }

    // Fetch exam to verify it exists
    const exam = await db
      .select()
      .from(exams)
      .where(eq(exams.id, examIdNum))
      .limit(1);

    if (!exam.length) {
      return NextResponse.json(
        { message: "Exam not found" },
        { status: 404 }
      );
    }

    // Fetch all attempts for this exam
    const examAttempts = await db
      .select()
      .from(attempts)
      .where(eq(attempts.examId, examIdNum));

    // Optimize: Fetch all artifacts for all attempts in a single query
    const attemptIds = examAttempts.map(a => a.id);
    const allArtifacts = attemptIds.length > 0 ? await db
      .select()
      .from(verificationArtifacts)
      .where(inArray(verificationArtifacts.attemptId, attemptIds)) : [];

    // Group artifacts by attemptId
    const artifactsByAttempt = new Map<number, typeof allArtifacts>();
    allArtifacts.forEach(artifact => {
      const attemptId = artifact.attemptId;
      if (!artifactsByAttempt.has(attemptId)) {
        artifactsByAttempt.set(attemptId, []);
      }
      artifactsByAttempt.get(attemptId)!.push(artifact);
    });

    // Build the final result
    const attemptsWithArtifacts = examAttempts.map(attempt => ({
      ...attempt,
      artifacts: artifactsByAttempt.get(attempt.id) || [],
    }));

    return NextResponse.json(attemptsWithArtifacts);
  } catch (error) {
    console.error("Error fetching exam attempts:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
