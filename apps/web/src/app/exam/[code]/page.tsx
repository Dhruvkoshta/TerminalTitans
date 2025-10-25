import { notFound } from "next/navigation";
import VerificationWizard from "@/components/verification/VerificationWizard";
import { db, eq } from "@my-better-t-app/db";
import { exams } from "@my-better-t-app/db/schema/auth";

export default async function ExamByCodePage({
	params,
}: {
	params: Promise<{ code: string }>;
}) {
	const { code } = await params;

	// Use database query instead of fetch to avoid URL issues
	const examResults = await db
		.select()
		.from(exams)
		.where(eq(exams.examCode, code))
		.limit(1);

	if (examResults.length === 0) {
		return notFound();
	}

	const exam = examResults[0];

	return (
		<div className='min-h-screen p-8'>
			<div className='max-w-4xl mx-auto'>
				<VerificationWizard
					examCode={exam.examCode}
					examName={exam.name}
					durationMins={Number(exam.duration) || 15}
					examId={String(exam.id)}
				/>
			</div>
		</div>
	);
}
