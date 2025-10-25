"use client";

import { Suspense, use } from "react";
import ExamResponsesPage from "@/components/ExamResponsesPage";

export default function ExamResponsesRoute({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);

	return (
		<Suspense
			fallback={
				<div className='min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
				</div>
			}
		>
			<ExamResponsesPage examId={id} />
		</Suspense>
	);
}
