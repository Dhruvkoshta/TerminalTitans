import { notFound } from "next/navigation";
import VerificationWizard from "@/components/verification/VerificationWizard";

export default async function ExamByCodePage({
	params,
}: {
	params: Promise<{ code: string }>;
}) {
	const { code } = await params;
	const res = await fetch(
		`${
			process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
		}/api/exams/examByCode?exam_code=${encodeURIComponent(code)}`,
		{ cache: "no-store" }
	);
	if (!res.ok) return notFound();
	const exam = await res.json();

	return (
		<div className='min-h-screen p-8'>
			<div className='max-w-4xl mx-auto'>
				<VerificationWizard
					examCode={exam.examCode || exam.exam_code}
					examName={exam.name}
					durationMins={Number(exam.duration) || 15}
					examLink={exam.examLink || exam.exam_link}
				/>
			</div>
		</div>
	);
}
