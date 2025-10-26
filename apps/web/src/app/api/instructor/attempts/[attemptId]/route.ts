import { db, eq } from "@my-better-t-app/db";
import { attempts, verificationArtifacts } from "@my-better-t-app/db/schema/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/instructor/attempts/[attemptId]
 * Fetch a specific attempt with all its verification artifacts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const attemptIdNum = parseInt(attemptId, 10);

    if (isNaN(attemptIdNum)) {
      return NextResponse.json(
        { message: "Invalid attempt ID" },
        { status: 400 }
      );
    }

    // Fetch the attempt
    const attemptData = await db
      .select()
      .from(attempts)
      .where(eq(attempts.id, attemptIdNum))
      .limit(1);

    if (!attemptData.length) {
      return NextResponse.json(
        { message: "Attempt not found" },
        { status: 404 }
      );
    }

    // Fetch artifacts for this attempt
    const artifacts = await db
      .select()
      .from(verificationArtifacts)
      .where(eq(verificationArtifacts.attemptId, attemptIdNum));

    const attempt = {
      ...attemptData[0],
      artifacts,
    };

    return NextResponse.json(attempt);
  } catch (error) {
    console.error("Error fetching attempt details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
