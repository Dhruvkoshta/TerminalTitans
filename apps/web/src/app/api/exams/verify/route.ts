import { db, eq, and } from "@my-better-t-app/db";
import { exams, attempts, verificationArtifacts } from "@my-better-t-app/db/schema/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Accept flexible inputs
    const examIdInput = body.examId as number | undefined;
    const examCodeInput = (body.exam_code || body.examCode) as string | undefined;
    const studentId = (body.studentId || body.studentEmail || body.student_email) as string | undefined;

    if (!examIdInput && !examCodeInput) {
      return Response.json({ message: "examId or exam_code is required" }, { status: 400 });
    }
    if (!studentId) {
      return Response.json({ message: "studentId or studentEmail is required" }, { status: 400 });
    }

    // Resolve examId
    let examId = examIdInput ?? 0;
    if (!examId && examCodeInput) {
      const ex = await db.select().from(exams).where(eq(exams.examCode, examCodeInput)).limit(1);
      if (!ex.length) return Response.json({ message: "Invalid exam_code" }, { status: 400 });
      examId = ex[0].id;
    }

    // Find or create attempt for this exam + student
    let attemptId: number;
    const existing = await db
      .select()
      .from(attempts)
      .where(and(eq(attempts.examId, examId), eq(attempts.studentId, studentId)))
      .limit(1);

    if (existing.length) {
      attemptId = existing[0].id;
    } else {
      const created = await db
        .insert(attempts)
        .values({ examId, studentId })
        .returning();
      attemptId = created[0].id;
    }

    // Normalize artifacts input: either array or single
    type Artifact = { type: string; url: string; meta?: any };
    const artifacts: Artifact[] = Array.isArray(body.artifacts)
      ? body.artifacts
      : body.type && body.url
      ? [{ type: body.type, url: body.url, meta: body.meta }]
      : [];

    if (!artifacts.length) {
      return Response.json({ attemptId, inserted: 0 });
    }

    await db.insert(verificationArtifacts).values(
      artifacts.map((a) => ({ attemptId, type: String(a.type), url: String(a.url), meta: a.meta }))
    );

    return Response.json({ attemptId, inserted: artifacts.length });
  } catch (e) {
    return Response.json({ message: "Error Occurred" }, { status: 400 });
  }
}
