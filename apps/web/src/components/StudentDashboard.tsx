"use client";
import React, { useState } from "react";

type Exam = {
	id: string;
	name: string;
	datetime: string;
	status: "Scheduled" | "Completed" | "Pending";
};

type Result = {
	id: string;
	name: string;
	score: number; // out of 100
};

export default function StudentDashboard() {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const studentName = "Aayush"; // placeholder

	const upcoming: Exam[] = [
		{
			id: "e1",
			name: "Calculus Midterm",
			datetime: "July 25, 10:00 AM",
			status: "Scheduled",
		},
		{
			id: "e2",
			name: "English Lit Quiz",
			datetime: "Aug 1, 2:00 PM",
			status: "Scheduled",
		},
	];

	const recentResults: Result[] = [
		{ id: "r1", name: "Physics Quiz 1", score: 85 },
		{ id: "r2", name: "Chemistry Lab Test", score: 78 },
	];

	const performance = [
		{ subject: "Math", score: 82 },
		{ subject: "Science", score: 76 },
		{ subject: "History", score: 88 },
		{ subject: "English", score: 91 },
	];

	// Simple helpers
	const pct = (n: number) => `${n}%`;

	return (
		<div className='min-h-screen bg-background text-foreground'>
			<div className='flex'>
				{/* Sidebar */}
				<aside
					className={`hidden md:flex md:flex-col md:w-64 bg-card border-r border-border p-4 ${
						sidebarOpen ? "" : "w-20"
					}`}
				>
					<div className='flex items-center gap-3 px-2'>
						<div className='h-10 w-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold'>
							P
						</div>
						<div className={`flex-1 ${sidebarOpen ? "" : "hidden"}`}>
							<div className='text-lg font-semibold'>ProctoAI</div>
						</div>
						<button
							className='md:hidden p-1'
							onClick={() => setSidebarOpen((s) => !s)}
							aria-label='toggle sidebar'
						>
							{/* simple hamburger */}
							<svg
								className='h-6 w-6 text-muted-foreground'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeWidth={2}
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M4 6h16M4 12h16M4 18h16'
								/>
							</svg>
						</button>
					</div>

					<nav className='mt-6 flex-1'>
						<ul className='space-y-1'>
							<li>
								<a
									className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary bg-primary/10'
									href='#'
								>
									{/* dashboard icon */}
									<svg
										className='h-5 w-5'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeWidth={2}
											strokeLinecap='round'
											strokeLinejoin='round'
											d='M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z'
										/>
									</svg>
									<span className={`${sidebarOpen ? "" : "hidden"}`}>
										Dashboard
									</span>
								</a>
							</li>
							<li>
								<a
									className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary'
									href='#'
								>
									<svg
										className='h-5 w-5'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeWidth={2}
											strokeLinecap='round'
											strokeLinejoin='round'
											d='M8 7V3m8 4V3M3 11h18M5 21h14'
										/>
									</svg>
									<span className={`${sidebarOpen ? "" : "hidden"}`}>
										My Exams
									</span>
								</a>
							</li>
							<li>
								<a
									className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary'
									href='#'
								>
									<svg
										className='h-5 w-5'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeWidth={2}
											strokeLinecap='round'
											strokeLinejoin='round'
											d='M9 12l2 2 4-4'
										/>
									</svg>
									<span className={`${sidebarOpen ? "" : "hidden"}`}>
										Results
									</span>
								</a>
							</li>
							<li>
								<a
									className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary'
									href='#'
								>
									<svg
										className='h-5 w-5'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
									>
										<path
											strokeWidth={2}
											strokeLinecap='round'
											strokeLinejoin='round'
											d='M5.121 17.804A13.937 13.937 0 0112 15c2.761 0 5.303.88 7.379 2.39M15 11a3 3 0 11-6 0 3 3 0 016 0z'
										/>
									</svg>
									<span className={`${sidebarOpen ? "" : "hidden"}`}>
										Profile
									</span>
								</a>
							</li>
							<li>
								<a
									className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary'
									href='#'
								>
									<svg
										className='h-5 w-5'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
									>
										<path
											strokeWidth={2}
											strokeLinecap='round'
											strokeLinejoin='round'
											d='M12 8v4l3 3'
										/>
									</svg>
									<span className={`${sidebarOpen ? "" : "hidden"}`}>
										Settings
									</span>
								</a>
							</li>
						</ul>
					</nav>

					<div className={`mt-auto pt-4 ${sidebarOpen ? "" : "hidden"}`}>
						<div className='flex items-center gap-3 rounded-lg p-2 hover:bg-secondary'>
							<div className='h-10 w-10 rounded-full bg-secondary' />
							<div>
								<div className='text-sm font-medium'>{studentName}</div>
								<div className='text-xs text-muted-foreground'>Student</div>
							</div>
						</div>
						<button className='mt-3 w-full rounded-md bg-destructive text-destructive-foreground py-2 text-sm font-medium hover:bg-destructive/90'>
							Log out
						</button>
					</div>
				</aside>

				{/* Main content area */}
				<div className='flex-1'>
					<header className='sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3'>
						<div className='flex items-center gap-4'>
							<button
								className='md:hidden p-1'
								onClick={() => setSidebarOpen((s) => !s)}
								aria-label='toggle sidebar'
							>
								<svg
									className='h-6 w-6 text-muted-foreground'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeWidth={2}
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M4 6h16M4 12h16M4 18h16'
									/>
								</svg>
							</button>
							<div className='relative hidden sm:block'>
								<input
									className='w-72 rounded-md border border-border bg-background px-3 py-2 text-sm placeholder-muted-foreground'
									placeholder='Search exams, results...'
								/>
							</div>
						</div>

						<div className='flex items-center gap-4'>
							<button className='p-2 rounded-md hover:bg-secondary'>
								<svg
									className='h-6 w-6 text-muted-foreground'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeWidth={2}
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5'
									/>
								</svg>
							</button>
							<div className='h-8 w-8 rounded-full bg-secondary' />
						</div>
					</header>

					<main className='p-6'>
						<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
							{/* Welcome / Overview */}
							<div className='md:col-span-2 rounded-xl bg-card p-6 shadow-sm'>
								<div className='flex items-center justify-between'>
									<div>
										<h2 className='text-2xl font-semibold'>
											Welcome, {studentName}!
										</h2>
										<p className='mt-1 text-sm text-muted-foreground'>
											You're doing great — keep up the momentum. Exams
											remaining: <span className='font-medium'>2</span>
										</p>
									</div>
									<div className='flex items-center gap-3'>
										<button className='rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
											Start Exam
										</button>
										<button className='rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-secondary'>
											View Schedule
										</button>
									</div>
								</div>

								<div className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3'>
									<div className='rounded-lg bg-secondary p-4'>
										<div className='text-sm text-muted-foreground'>
											Upcoming
										</div>
										<div className='mt-1 text-xl font-semibold'>2</div>
									</div>
									<div className='rounded-lg bg-secondary p-4'>
										<div className='text-sm text-muted-foreground'>
											Completed
										</div>
										<div className='mt-1 text-xl font-semibold'>12</div>
									</div>
									<div className='rounded-lg bg-secondary p-4'>
										<div className='text-sm text-muted-foreground'>
											Avg Score
										</div>
										<div className='mt-1 text-xl font-semibold'>84%</div>
									</div>
								</div>
							</div>

							{/* Upcoming Exams */}
							<section className='rounded-xl bg-card p-4 shadow-sm'>
								<h3 className='text-lg font-medium'>Upcoming Exams</h3>
								<ul className='mt-3 space-y-3'>
									{upcoming.map((ex) => (
										<li
											key={ex.id}
											className='flex items-center justify-between rounded-md border border-border bg-background p-3'
										>
											<div>
												<div className='font-medium'>{ex.name}</div>
												<div className='text-sm text-muted-foreground'>
													{ex.datetime}
												</div>
											</div>
											<div className='flex items-center gap-2'>
												<div className='text-sm text-muted-foreground'>
													{ex.status}
												</div>
												<button className='rounded-md bg-primary px-3 py-1 text-primary-foreground text-sm hover:bg-primary/90'>
													Join Exam
												</button>
											</div>
										</li>
									))}
								</ul>
							</section>
						</div>

						<div className='mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3'>
							{/* Recent Results */}
							<div className='rounded-xl bg-card p-4 shadow-sm'>
								<h4 className='text-lg font-medium'>Recent Results</h4>
								<ul className='mt-3 space-y-2'>
									{recentResults.map((r) => (
										<li
											key={r.id}
											className='flex items-center justify-between p-2'
										>
											<div>
												<div className='font-medium'>{r.name}</div>
												<div className='text-sm text-muted-foreground'>
													{r.score}/100
												</div>
											</div>
											<button className='rounded-md border border-border bg-background px-3 py-1 text-sm hover:bg-secondary'>
												View Details
											</button>
										</li>
									))}
								</ul>
							</div>

							{/* Performance Chart (simple bar chart) */}
							<div className='rounded-xl bg-card p-4 shadow-sm'>
								<h4 className='text-lg font-medium'>
									Performance Across Subjects
								</h4>
								<div className='mt-4 space-y-3'>
									{performance.map((p) => (
										<div key={p.subject}>
											<div className='flex items-center justify-between text-sm'>
												<div className='text-muted-foreground'>{p.subject}</div>
												<div className='text-muted-foreground'>
													{pct(p.score)}
												</div>
											</div>
											<div className='mt-2 h-3 w-full rounded-full bg-secondary'>
												<div
													className='h-3 rounded-full bg-primary'
													style={{ width: `${p.score}%` }}
												/>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Proctoring Insights */}
							<div className='rounded-xl bg-card p-4 shadow-sm lg:col-span-3'>
								<h4 className='text-lg font-medium'>Proctoring Insights</h4>
								<p className='mt-2 text-sm text-muted-foreground'>
									No major incidents recorded. Your proctoring data helps
									maintain exam integrity.
								</p>
							</div>

							{/* Quick Links */}
							<div className='rounded-xl bg-card p-4 shadow-sm lg:col-span-3'>
								<h4 className='text-lg font-medium'>Quick Links</h4>
								<div className='mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4'>
									{[
										{ title: "Proctoring Guidelines" },
										{ title: "System Check" },
										{ title: "FAQ" },
										{ title: "Support" },
									].map((l) => (
										<a
											key={l.title}
											className='rounded-md bg-secondary p-3 text-sm text-secondary-foreground hover:bg-secondary/80'
											href='#'
										>
											{l.title}
										</a>
									))}
								</div>
							</div>
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}
