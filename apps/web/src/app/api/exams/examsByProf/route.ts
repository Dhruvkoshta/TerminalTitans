import { db, and, eq } from "@my-better-t-app/db";
import { exams } from "@my-better-t-app/db/schema/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const exam_code = searchParams.get("exam_code");
  const prof_email = searchParams.get("prof_email");

  if (!exam_code || !prof_email) {
    return Response.json({ message: "exam_code and prof_email are required" }, { status: 400 });
  }

  const result = await db
    .select()
    .from(exams)
    .where(and(eq(exams.examCode, exam_code), eq(exams.profEmail, prof_email)))
    .limit(1);

  if (!result.length) {
    return Response.json({ message: "Exam doesn't exist or professor doesnt have permission" }, { status: 400 });
  }

  return Response.json(result[0]);
}
