
			"use client";
			import React from "react";
			import { useQuery } from "@tanstack/react-query";
			import { trpc } from "@/utils/trpc";
			import { Button } from "@/components/ui/button";
			import { Card, CardContent } from "@/components/ui/card";
			import TrustedBy from "@/components/trusted-by";

			export default function Home() {
				const healthCheck = useQuery(trpc.healthCheck.queryOptions());

				const services = [
					{
						title: "Student Dashboard",
						desc: "A personalized student hub with upcoming exams and progress.\\nClear widgets for quick access and reminders.",
						img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop",
					},
					{
						title: "Student Result Page",
						desc: "Detailed score breakdown and feedback per section.\\nDownloadable certificates and share options.",
						img: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1600&auto=format&fit=crop",
					},
					{
						title: "Exam Interface",
						desc: "Fast, distraction-free exam UI with rich question types.\\nAuto-save and reconnection support during sessions.",
						img: "https://images.unsplash.com/photo-1555949963-aa79dcee981d?q=80&w=1600&auto=format&fit=crop",
					},
					{
						title: "Admin Dashboard",
						desc: "High-level controls for exams, users, and reports.\\nQuick actions for bulk operations and oversight.",
						img: "https://images.unsplash.com/photo-1554168193-95d4e6a3d9d6?q=80&w=1600&auto=format&fit=crop",
					},
					{
						title: "Exam Configuration",
						desc: "Flexible exam settings: timings, grading, and policies.\\nPreview mode to verify configuration before launch.",
						img: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1600&auto=format&fit=crop",
					},
					{
						title: "Report Analytics",
						desc: "Interactive analytics with filters and export options.\\nIdentify trends and focus areas at a glance.",
						img: "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?q=80&w=1600&auto=format&fit=crop",
					},
					{
						title: "Admin Support & Help",
						desc: "In-app support center and guided walkthroughs.\\nFast ticketing and priority response options.",
						img: "https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=1600&auto=format&fit=crop",
					},
					{
						title: "Proctoring Review",
						desc: "Playback with annotated flags and timestamps.\\nTeam review queues and verdict controls.",
						img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop",
					},
					{
						title: "Platform Settings",
						desc: "Global configuration for branding and security.\\nRole-based access and audit logs for compliance.",
						img: "https://images.unsplash.com/photo-1508830524289-0adcbe822b40?q=80&w=1600&auto=format&fit=crop",
					},
					{
						title: "Live Proctor Monitoring",
						desc: "Real-time proctor dashboards for active exams.\\nAlerts, multi-feed views, and action tools.",
						img: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1600&auto=format&fit=crop",
					},
				];

				return (
					<main className="min-h-screen flex flex-col items-center justify-start bg-slate-900 text-slate-100">
						<div className="w-full max-w-6xl px-6 py-20">
							<section className="relative mb-16 grid gap-8 lg:grid-cols-2 lg:items-center">
								<div className="z-10">
									<h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">Make Every Exam Secure</h1>
									<p className="mt-4 max-w-xl text-lg text-purple-200/90">AI-powered proctoring that keeps exams fair, private, and simple to manage.</p>

									<div className="mt-8 flex items-center gap-4">
										<a
											href="#"
											className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-transform"
										>
											Get started
										</a>
										<a
											href="#"
											className="inline-flex items-center gap-2 rounded-full bg-slate-800/50 px-5 py-3 text-sm font-medium text-white ring-1 ring-white/10 hover:bg-slate-800/70 transition-colors"
										>
											Talk to a human
										</a>
									</div>
								</div>

								<div className="relative z-0 mt-6 flex h-72 items-center justify-center lg:mt-0">
									{/* faded purple background */}
									<div className="absolute inset-0 rounded-3xl bg-purple-900/40 backdrop-blur-sm" />
									{/* uploaded AI image (place the file at public/images/ai-face.svg) */}
									<img src="/images/ai-face.svg" alt="AI face" className="relative h-72 w-72 rounded-3xl object-cover shadow-2xl ring-1 ring-white/6" />
								</div>
							</section>

							<TrustedBy />

							{/* Primary Features (Student Dashboard, Live Proctor Monitoring, etc.) */}
							<div className="mt-8 space-y-6">
								{services.map((s, idx) => (
									<Card key={s.title} className={`overflow-hidden sm:flex-row ${idx % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row"}`}>
										<div className="sm:w-1/2 w-full overflow-hidden rounded-lg">
											<img src={s.img} alt={s.title} className="h-56 w-full object-cover transition-transform duration-500 hover:scale-105" />
										</div>
										<CardContent className="sm:w-1/2 w-full">
											<h3 className="text-2xl font-semibold text-white">{s.title}</h3>
											{s.desc.split("\\n").map((line, i) => (
												<p key={i} className="mt-2 text-sm text-purple-100/90">{line}</p>
											))}
											<div className="mt-4">
												<Button variant="ghost" size="sm">Learn more</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>

							{/* How It Works - 3 steps */}
							<section className="mt-12 rounded-2xl bg-slate-800/30 p-6 backdrop-blur-md">
								<div className="mx-auto max-w-4xl text-center">
									<h2 className="text-2xl font-bold text-white">Get started in 3 simple steps</h2>
									<p className="mt-2 text-sm text-purple-100/80">Set up exams, monitor live sessions, and review results with ease.</p>
								</div>

								<div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
									<div className="flex-1 rounded-lg bg-slate-900/50 p-6">
										<div className="text-3xl font-extrabold text-purple-300">01</div>
										<h3 className="mt-3 text-lg font-semibold text-white">Create Your Exam</h3>
										<p className="mt-2 text-sm text-purple-100/80">Set up your test, add questions, and configure security settings in minutes.</p>
									</div>

									<div className="flex-1 rounded-lg bg-slate-900/50 p-6">
										<div className="text-3xl font-extrabold text-purple-300">02</div>
										<h3 className="mt-3 text-lg font-semibold text-white">Invite Students</h3>
										<p className="mt-2 text-sm text-purple-100/80">Share secure links and pre-check system requirements to ensure smooth delivery.</p>
									</div>

									<div className="flex-1 rounded-lg bg-slate-900/50 p-6">
										<div className="text-3xl font-extrabold text-purple-300">03</div>
										<h3 className="mt-3 text-lg font-semibold text-white">Review & Report</h3>
										<p className="mt-2 text-sm text-purple-100/80">Analyze flagged events, export reports, and take action where needed.</p>
									</div>
								</div>
							</section>

							{/* More Features grid */}
							<section className="mt-10">
								<div className="mx-auto max-w-4xl text-center">
									<h2 className="text-2xl font-bold text-white">Everything you need for secure exams</h2>
									<p className="mt-2 text-sm text-purple-100/80">Robust features designed for integrity, scalability, and ease-of-use.</p>
								</div>

								<div className="mt-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
									{[
										{
											title: "AI-Powered Alerts",
											desc: "Smart detection flags suspicious behaviour in real-time.",
										},
										{
											title: "ID Verification",
											desc: "Secure identity checks before exam start.",
										},
										{
											title: "Secure Browser Lockdown",
											desc: "Prevent tab switching and external resource access.",
										},
										{
											title: "Multi-Camera Support",
											desc: "Monitor multiple feeds for enhanced coverage.",
										},
										{
											title: "Detailed Analytics",
											desc: "Exportable reports with actionable insights.",
										},
										{
											title: "Role-Based Access",
											desc: "Granular permissions for admins and reviewers.",
										},
									].map((f) => (
										<div key={f.title} className="rounded-xl bg-slate-800/30 p-6 hover:scale-[1.02] transition-transform">
											<div className="flex items-center gap-4">
												{/* placeholder icon */}
												<svg className="h-8 w-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m4-2h.01M12 6v.01"></path></svg>
												<div>
													<h4 className="text-lg font-semibold text-white">{f.title}</h4>
													<p className="mt-1 text-sm text-purple-100/80">{f.desc}</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</section>

							{/* FAQ accordion */}
							<section className="mt-12 mx-auto max-w-4xl">
								<h2 className="text-center text-2xl font-bold text-white">Frequently Asked Questions</h2>
								<div className="mt-6 space-y-3">
									{[
										{
											q: "How does the AI detect cheating?",
											a: "We use a combination of face detection, gaze estimation, audio signals, and behavioral patterns to flag suspicious events for human review.",
										},
										{
											q: "Is my data secure and private?",
											a: "All data is encrypted in transit and at rest; access is role-based and audit-logged to ensure compliance.",
										},
										{
											q: "What are the technical requirements for students?",
											a: "Students need a modern browser, webcam, microphone, and a stable internet connection. Mobile support varies by configuration.",
										},
										{
											q: "Can I review flagged sessions manually?",
											a: "Yes — reviewers can play back sessions with annotated flags and timestamps to make final decisions.",
										},
										{
											q: "How accurate are the AI alerts?",
											a: "The AI aims to minimize false positives; all alerts should be reviewed by a human before any action is taken.",
										},
									].map((item) => (
										<details key={item.q} className="rounded-lg bg-slate-800/30 p-4">
											<summary className="cursor-pointer text-white font-medium">{item.q}</summary>
											<p className="mt-2 text-sm text-purple-100/80">{item.a}</p>
										</details>
									))}
								</div>
							</section>

							{/* CTA */}
							<section className="mt-12 text-center">
								<h2 className="text-3xl font-extrabold text-white">Make Every Exam Secure Today</h2>
								<p className="mt-3 text-sm text-purple-100/80">Get started with PROCTO and ensure fairness and integrity for all your assessments.</p>
								<div className="mt-6 flex items-center justify-center gap-4">
									<Button className="bg-linear-to-r from-indigo-500 to-pink-500 text-white" asChild>
										<a href="#">Get Started</a>
									</Button>
									<Button variant="outline" asChild>
										<a href="#">Talk to a Human</a>
									</Button>
								</div>
							</section>


				{/* Footer */}
				<footer className="mt-12 w-full border-t border-slate-700/40 pt-10">
					<div className="mx-auto max-w-6xl px-6 text-slate-300">
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
							<div>
								<h4 className="mb-3 text-lg font-semibold text-white">Product</h4>
								<ul className="space-y-2 text-sm">
									<li><a className="hover:text-white" href="#">Student Dashboard</a></li>
									<li><a className="hover:text-white" href="#">Live Proctor Monitoring</a></li>
									<li><a className="hover:text-white" href="#">Exam Interface</a></li>
									<li><a className="hover:text-white" href="#">Analytics</a></li>
								</ul>
							</div>
							<div>
								<h4 className="mb-3 text-lg font-semibold text-white">Resources</h4>
								<ul className="space-y-2 text-sm">
									<li><a className="hover:text-white" href="#">Docs</a></li>
									<li><a className="hover:text-white" href="#">API</a></li>
									<li><a className="hover:text-white" href="#">Support</a></li>
								</ul>
							</div>
							<div>
								<h4 className="mb-3 text-lg font-semibold text-white">Company</h4>
								<ul className="space-y-2 text-sm">
									<li><a className="hover:text-white" href="#">About</a></li>
									<li><a className="hover:text-white" href="#">Careers</a></li>
									<li><a className="hover:text-white" href="#">Contact</a></li>
								</ul>
							</div>
							<div>
								<h4 className="mb-3 text-lg font-semibold text-white">Legal</h4>
								<ul className="space-y-2 text-sm">
									<li><a className="hover:text-white" href="#">Terms</a></li>
									<li><a className="hover:text-white" href="#">Privacy</a></li>
									<li><a className="hover:text-white" href="#">Security</a></li>
								</ul>
							</div>
						</div>

						<div className="mt-8 flex items-center justify-between border-t border-slate-700/30 pt-6">
							<div className="text-sm text-slate-400">© {new Date().getFullYear()} PROCTO • All rights reserved.</div>
							<div className="flex items-center gap-4 text-sm">
								<div className="flex items-center gap-2">
									<div className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`} />
									<span className="text-sm text-slate-400">{healthCheck.isLoading ? "Checking..." : healthCheck.data ? "Connected" : "Disconnected"}</span>
								</div>
							</div>
						</div>
					</div>
				</footer>
						</div>
					</main>
				);
			}
