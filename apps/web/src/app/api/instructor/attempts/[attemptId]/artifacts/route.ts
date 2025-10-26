import { db, eq } from "@my-better-t-app/db";
import { verificationArtifacts } from "@my-better-t-app/db/schema/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/instructor/attempts/[attemptId]/artifacts
 * Fetch all verification artifacts for an attempt
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

    // Fetch artifacts for this attempt
    const artifacts = await db
      .select()
      .from(verificationArtifacts)
      .where(eq(verificationArtifacts.attemptId, attemptIdNum));

    return NextResponse.json(artifacts);
  } catch (error) {
    console.error("Error fetching artifacts:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
