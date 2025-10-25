import { db } from "@my-better-t-app/db";
import { exams, examQuestions, mcqOptions, codingTestCases } from "@my-better-t-app/db/schema/auth";

function randomCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.ownerEmail && !body.prof_email) {
      return Response.json({ message: "Owner email is required" }, { status: 400 });
    }
    
    if (!body.title || body.title.trim() === "") {
      return Response.json({ message: "Exam title is required" }, { status: 400 });
    }

    // Map InstructorDashboard payload -> minimal insert that works today
    const code = body.exam_code || randomCode(6);
    const start = body.startTime ? new Date(body.startTime) : new Date();
    const duration = typeof body.durationMin === "number" ? body.durationMin : 60;

    // Insert the exam first
    const inserted = await db
      .insert(exams)
      .values({
        name: body.title || "Untitled Exam",
        profEmail: body.prof_email || body.ownerEmail || "unknown@local",
        examLink: body.exam_link || body.form_link || "about:blank",
        dateTimeStart: start,
        duration,
        examCode: code,
        status: body.status === "published" ? "published" : "draft",
        settings: {
          course: body.course || undefined,
          meta: body.meta || undefined,
          proctoring: body.proctoring || undefined,
        },
      })
      .returning();

    const exam = inserted[0];

    // Now insert questions if they exist
    if (Array.isArray(body.questions) && body.questions.length > 0) {
      for (const question of body.questions) {
        // Insert the question
        const insertedQuestions = await db
          .insert(examQuestions)
          .values({
            examId: exam.id,
            type: question.type || "mcq",
            title: question.title || "Untitled Question",
            prompt: question.prompt || "",
            points: question.points || 10,
          })
          .returning();

        const questionRecord = insertedQuestions[0];

        // Insert MCQ options if applicable
        if (question.type === "mcq" && Array.isArray(question.options)) {
          for (const option of question.options) {
            await db.insert(mcqOptions).values({
              questionId: questionRecord.id,
              text: option.text || "",
              isCorrect: !!option.isCorrect,
            });
          }
        }

        // Insert coding test cases if applicable
        if (question.type === "coding" && Array.isArray(question.testCases)) {
          for (const testCase of question.testCases) {
            await db.insert(codingTestCases).values({
              questionId: questionRecord.id,
              input: testCase.input || "",
              expectedOutput: testCase.expectedOutput || "",
            });
          }
        }
      }
    }

    return Response.json({
      id: exam.id,
      code: exam.examCode,
      status: exam.status,
      settings: exam.settings,
      shareUrl: `/exam/${exam.examCode}`,
      message: `Exam created successfully with ${body.questions?.length || 0} questions`,
    });
  } catch (e: any) {
    console.error("Error creating exam:", e);
    return Response.json({ message: e?.message || "Error Occurred" }, { status: 400 });
  }
}
