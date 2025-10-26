"use client";
import { Button } from "@/components/ui/button";
import type { authClient } from "@/lib/auth-client";
import { useEffect, useMemo, useState } from "react";
import CreateExamPage from "./CreateExamPage";
import { Plus, Eye, FileText, ExternalLink, Loader2 } from "lucide-react";

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
		<div className='min-h-screen bg-background'>
			{/* Header */}
			<div className='bg-linear-to-r from-primary/10 to-accent/10 border-b border-border px-6 py-8'>
				<div className='max-w-7xl mx-auto flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-foreground'>
							Instructor Dashboard
						</h1>
						<p className='text-muted-foreground mt-1'>
							Manage your exams and student responses
						</p>
					</div>
					{openExamPage ? (
						<Button
							variant='outline'
							onClick={() => setOpenExamPage(false)}
							className='border-border hover:bg-secondary'
						>
							Close
						</Button>
					) : (
						<Button
							onClick={() => setOpenExamPage(true)}
							className='bg-primary hover:bg-primary/90 text-primary-foreground gap-2'
						>
							<Plus className='h-4 w-4' />
							Create Exam
						</Button>
					)}
				</div>
			</div>

			<div className='max-w-7xl mx-auto px-6 py-6 space-y-6'>
				{openExamPage && (
					<div className='border border-border rounded-lg p-4 bg-card shadow-md'>
						<CreateExamPage session={session} />
					</div>
				)}
				{/* Your Exams Section */}
				<section className='space-y-4'>
					<div>
						<h2 className='text-xl font-semibold text-foreground'>
							Your Exams
						</h2>
						<p className='text-sm text-muted-foreground mt-1'>
							Manage and monitor all your created exams
						</p>
					</div>
					{loading && (
						<div className='flex items-center justify-center py-12'>
							<div className='text-center space-y-3'>
								<Loader2 className='h-8 w-8 animate-spin text-primary mx-auto' />
								<p className='text-muted-foreground'>Loading your exams...</p>
							</div>
						</div>
					)}
					{error && (
						<div className='bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg'>
							<p className='font-medium'>Error</p>
							<p className='text-sm'>{error}</p>
						</div>
					)}
					{!loading && !error && (
						<div className='border border-border rounded-lg overflow-hidden shadow-sm'>
							<div className='overflow-x-auto'>
								<table className='w-full text-sm'>
									<thead className='bg-secondary/50 border-b border-border'>
										<tr className='text-left'>
											<th className='px-6 py-3 font-semibold text-foreground'>
												Exam Name
											</th>
											<th className='px-6 py-3 font-semibold text-foreground'>
												Code
											</th>
											<th className='px-6 py-3 font-semibold text-foreground'>
												Start Time
											</th>
											<th className='px-6 py-3 font-semibold text-foreground'>
												Duration
											</th>
											<th className='px-6 py-3 font-semibold text-foreground'>
												Status
											</th>
											<th className='px-6 py-3 font-semibold text-foreground'>
												Actions
											</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-border'>
										{exams.map((ex: any) => (
											<tr
												key={ex.id}
												className='hover:bg-secondary/30 transition-colors'
											>
												<td className='px-6 py-4 font-medium'>{ex.name}</td>
												<td className='px-6 py-4'>
													<span className='font-mono text-xs bg-secondary/20 text-primary px-2 py-1 rounded'>
														{ex.examCode}
													</span>
												</td>
												<td className='px-6 py-4 text-sm text-muted-foreground'>
													{new Date(ex.dateTimeStart).toLocaleString?.() ??
														String(ex.dateTimeStart)}
												</td>
												<td className='px-6 py-4 text-sm'>{ex.duration} min</td>
												<td className='px-6 py-4'>
													<span
														className={`text-xs font-semibold px-3 py-1 rounded-full ${
															ex.status === "published"
																? "bg-primary/20 text-primary"
																: "bg-secondary/50 text-muted-foreground"
														}`}
													>
														{ex.status}
													</span>
												</td>
												<td className='px-6 py-4 space-x-2 flex items-center'>
													<a
														className='inline-flex items-center gap-1 px-3 py-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium'
														href={`/dashboard/exams/${
															ex.id
														}?prof_email=${encodeURIComponent(
															profEmail || ""
														)}`}
													>
														<FileText className='h-4 w-4' />
														Details
													</a>
													<a
														className='inline-flex items-center gap-1 px-3 py-1.5 rounded bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-sm font-medium'
														href={`/dashboard/exams/${ex.id}/responses`}
													>
														<Eye className='h-4 w-4' />
														Responses
													</a>
													<a
														className='inline-flex items-center gap-1 px-3 py-1.5 rounded bg-secondary text-foreground hover:bg-secondary/80 transition-colors text-sm font-medium'
														href={`/exam/${ex.examCode}`}
														target='_blank'
														rel='noreferrer'
													>
														<ExternalLink className='h-4 w-4' />
														Open
													</a>
												</td>
											</tr>
										))}
										{!exams.length && (
											<tr>
												<td
													className='px-6 py-8 text-center text-muted-foreground col-span-6'
													colSpan={6}
												>
													<div className='flex flex-col items-center justify-center'>
														<FileText className='h-12 w-12 text-muted-foreground/20 mb-2' />
														<p>No exams created yet</p>
														<p className='text-xs mt-1'>
															Create your first exam to get started
														</p>
													</div>
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</section>

				{!!activeExams.length && (
					<section className='space-y-4 mt-8 pt-6 border-t border-border'>
						<div>
							<h3 className='text-lg font-semibold text-foreground flex items-center gap-2'>
								<div className='h-3 w-3 rounded-full bg-primary animate-pulse' />
								Active Now
							</h3>
							<p className='text-sm text-muted-foreground mt-1'>
								Exams currently in session
							</p>
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
							{activeExams.map((ex: any) => (
								<a
									key={ex.id}
									className='group relative px-4 py-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors hover:border-primary/60'
									href={`/dashboard/exams/${
										ex.id
									}?prof_email=${encodeURIComponent(profEmail || "")}`}
								>
									<div className='flex items-center justify-between'>
										<div className='flex-1'>
											<p className='font-medium text-foreground group-hover:text-primary transition-colors'>
												{ex.name}
											</p>
											<p className='text-xs text-muted-foreground mt-1'>
												{ex.examCode}
											</p>
										</div>
										<ExternalLink className='h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors' />
									</div>
								</a>
							))}
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
