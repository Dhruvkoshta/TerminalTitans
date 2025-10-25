"use client";
import { Button } from "@/components/ui/button";
import type { authClient } from "@/lib/auth-client";
import { useEffect, useMemo, useState } from "react";
import CreateExamPage from "./CreateExamPage";

export default function InstructorDashboard({
	session,
}: {
	session: typeof authClient.$Infer.Session;
}) {
	const [openExamPage, setOpenExamPage] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [exams, setExams] = useState<any[]>([]);

	const profEmail = (session.user as any)?.email as string | undefined;

	useEffect(() => {
		async function load() {
			if (!profEmail) return;
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(
					`/api/exams/examsByProf?prof_email=${encodeURIComponent(profEmail)}`
				);
				const data = await res.json();
				if (!res.ok) throw new Error(data?.message || "Failed to load exams");
				setExams(Array.isArray(data) ? data : [data]);
			} catch (e: any) {
				setError(e?.message || "Could not fetch exams");
			} finally {
				setLoading(false);
			}
		}
		void load();
	}, [profEmail]);

	const activeExams = useMemo(() => {
		const now = Date.now();
		return exams.filter((x) => {
			const start = x.dateTimeStart ? new Date(x.dateTimeStart).getTime() : 0;
			const durationMin = Number(x.duration ?? 0);
			const end = start + durationMin * 60_000;
			return x.status === "published" && start <= now && now <= end;
		});
	}, [exams]);

	return (
		<div className='space-y-6 p-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-semibold'>Instructor Dashboard</h1>
				{openExamPage ? (
					<Button variant='outline' onClick={() => setOpenExamPage(false)}>
						Close Exam Creation
					</Button>
				) : (
					<Button onClick={() => setOpenExamPage(true)}>Create Exam</Button>
				)}
			</div>

			{openExamPage && (
				<div className='border rounded-md p-2 bg-muted/30'>
					<CreateExamPage session={session} />
				</div>
			)}

			<section className='space-y-3'>
				<h2 className='text-lg font-medium'>Your Exams</h2>
				{loading && (
					<div className='text-sm text-muted-foreground'>Loading…</div>
				)}
				{error && <div className='text-sm text-red-600'>{error}</div>}
				{!loading && !error && (
					<div className='overflow-x-auto'>
						<table className='min-w-full text-sm'>
							<thead className='border-b'>
								<tr className='text-left'>
									<th className='py-2 pr-4'>Name</th>
									<th className='py-2 pr-4'>Code</th>
									<th className='py-2 pr-4'>Start</th>
									<th className='py-2 pr-4'>Duration</th>
									<th className='py-2 pr-4'>Status</th>
									<th className='py-2 pr-4'>Actions</th>
								</tr>
							</thead>
							<tbody>
								{exams.map((ex: any) => (
									<tr key={ex.id} className='border-b'>
										<td className='py-2 pr-4'>{ex.name}</td>
										<td className='py-2 pr-4 font-mono'>{ex.examCode}</td>
										<td className='py-2 pr-4'>
											{new Date(ex.dateTimeStart).toLocaleString?.() ??
												String(ex.dateTimeStart)}
										</td>
										<td className='py-2 pr-4'>{ex.duration} min</td>
										<td className='py-2 pr-4'>{ex.status}</td>
										<td className='py-2 pr-4 space-x-2'>
											<a
												className='underline'
												href={`/dashboard/exams/${
													ex.id
												}?prof_email=${encodeURIComponent(profEmail || "")}`}
											>
												Details
											</a>
											<a
												className='underline'
												href={`/exam/${ex.examCode}`}
												target='_blank'
												rel='noreferrer'
											>
												Open
											</a>
										</td>
									</tr>
								))}
								{!exams.length && (
									<tr>
										<td className='py-4 text-muted-foreground' colSpan={6}>
											No exams yet
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}
			</section>

			{!!activeExams.length && (
				<section className='space-y-2'>
					<h3 className='text-base font-medium'>Active Now</h3>
					<div className='flex flex-wrap gap-2'>
						{activeExams.map((ex: any) => (
							<a
								key={ex.id}
								className='px-3 py-2 rounded border text-sm hover:bg-accent'
								href={`/dashboard/exams/${
									ex.id
								}?prof_email=${encodeURIComponent(profEmail || "")}`}
							>
								{ex.name} • {ex.examCode}
							</a>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
