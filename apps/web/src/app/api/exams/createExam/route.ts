import { db, eq } from "@my-better-t-app/db";
import { exams } from "@my-better-t-app/db/schema/auth";

function validateExamInput(body: any): { errors: Record<string, string>; isValid: boolean } {
  const errors: Record<string, string> = {};
  if (!body.name) errors.name = "Name is required";
  if (!body.prof_email) errors.prof_email = "prof_email is required";
  if (!body.exam_link) errors.exam_link = "exam_link is required";
  if (!body.date_time_start) errors.date_time_start = "date_time_start is required";
  if (typeof body.duration !== "number") errors.duration = "duration must be a number";
  if (!body.exam_code) errors.exam_code = "exam_code is required";
  return { errors, isValid: Object.keys(errors).length === 0 };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { errors, isValid } = validateExamInput(body);
    if (!isValid) return Response.json(errors, { status: 400 });

    const existing = await db.select().from(exams).where(eq(exams.examCode, body.exam_code)).limit(1);
    if (existing.length) {
      return Response.json({ name: "Exam with this code exists in database" }, { status: 400 });
    }

    const toInsert = {
      name: body.name,
      profEmail: body.prof_email,
      examLink: body.exam_link,
      dateTimeStart: new Date(body.date_time_start),
      duration: body.duration,
      examCode: body.exam_code,
    } as const;

    const inserted = await db.insert(exams).values(toInsert).returning();

    return Response.json(inserted[0], { status: 200 });
  } catch (e) {
    return Response.json({ message: "Error Occurred" }, { status: 400 });
  }
}
