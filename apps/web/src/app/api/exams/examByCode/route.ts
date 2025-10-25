import { db, eq } from "@my-better-t-app/db";
import { exams } from "@my-better-t-app/db/schema/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const exam_code = searchParams.get("exam_code");
  if (!exam_code) return Response.json({ message: "exam_code is required" }, { status: 400 });

  const result = await db.select().from(exams).where(eq(exams.examCode, exam_code)).limit(1);
  if (!result.length) return Response.json({ message: "Exam Code is invalid" }, { status: 400 });
  return Response.json(result[0]);
}
