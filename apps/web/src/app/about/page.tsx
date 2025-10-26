import Link from "next/link";

export default function AboutPage() {
	const values = [
		{
			title: "Integrity",
			icon: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-6 w-6 text-primary'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<path
						strokeWidth={1.5}
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z'
					/>
					<path
						strokeWidth={1.5}
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2'
					/>
				</svg>
			),
			desc: "We hold fairness first — our technology is designed to protect academic honesty without bias.",
		},
		{
			title: "Privacy",
			icon: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-6 w-6 text-primary'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<path
						strokeWidth={1.5}
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M12 11c0-3 4-3 4-6a4 4 0 10-8 0c0 3 4 3 4 6z'
					/>
					<path
						strokeWidth={1.5}
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M5 13v4a3 3 0 003 3h8a3 3 0 003-3v-4'
					/>
				</svg>
			),
			desc: "We protect student data through encryption and transparent privacy policies — always.",
		},
		{
			title: "Accessibility",
			icon: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-6 w-6 text-primary'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<path
						strokeWidth={1.5}
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M12 2v20M2 12h20'
					/>
				</svg>
			),
			desc: "We design for all students — on any device, with assistive features where needed.",
		},
		{
			title: "Innovation",
			icon: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-6 w-6 text-primary'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<path
						strokeWidth={1.5}
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M12 6v6l4 2'
					/>
					<path
						strokeWidth={1.5}
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
					/>
				</svg>
			),
			desc: "We continuously iterate on research-grade AI to create fair, accurate proctoring tools.",
		},
	];

	const team = [
		{
			name: "Dhruv Kumar Koshta",
			title: "Founder & CEO",
			imageurl: "/images/1738317760604.jpg",
			linkedin: "https://www.linkedin.com/in/dhruv-koshta-15252b296/",
		},
		{
			name: "Rohan Kumar",
			title: "CTO",
			imageurl: "/images/rohan.jpg",
			linkedin: "https://www.linkedin.com/in/rohan19725/",
		},
		{
			name: "Aayush Ranjan",
			title: "Head of Product",
			imageurl: "/images/1753517089180.jpg",
			linkedin: "https://www.linkedin.com/in/aayushprof/",
		},
		{
			name: "Navit Mathur",
			title: "Lead ML Engineer",
			imageurl: "/images/file.jpg",
			linkedin: "https://www.linkedin.com/in/navit-mathur-45053837b/",
		},
	];

	return (
		<main className='min-h-screen bg-background text-foreground'>
			{/* Hero */}
			<section className='pt-28 pb-16'>
				<div className='mx-auto max-w-6xl px-6 lg:flex lg:items-center lg:gap-12'>
					<div className='lg:w-1/2'>
						<h1 className='text-4xl font-extrabold leading-tight'>
							Our Mission: Ensuring Integrity in Every Exam
						</h1>
						<p className='mt-4 text-lg text-muted-foreground'>
							We believe that everyone deserves a fair and accessible education.
							ProctoAI was built to uphold academic honesty and provide equal
							opportunities for students everywhere, no matter where they learn.
						</p>
						<div className='mt-6 flex gap-3'>
							<Link
								href={"/signup" as any}
								className='rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90'
							>
								Get Started
							</Link>
							<Link
								href={"/about" as any}
								className='rounded-md border border-border bg-background px-4 py-2 text-foreground hover:bg-secondary'
							>
								Learn more
							</Link>
						</div>
					</div>
					<div className='mt-8 lg:mt-0 lg:w-1/2'>
						<div className='mx-auto max-w-md overflow-hidden rounded-xl bg-linear-to-tr from-primary to-accent p-6 shadow-lg'>
							{/* placeholder illustration */}
							<div className='h-56 w-full rounded-md bg-secondary' aria-hidden>
								<img
									src='/images/1.jpg'
									alt='office'
									className='h-56 w-full rounded-md object-cover'
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Our Story */}
			<section className='py-16'>
				<div className='mx-auto max-w-6xl px-6 lg:grid lg:grid-cols-2 lg:gap-12'>
					<div>
						<h2 className='text-3xl font-bold'>
							The Future of Fair Assessment
						</h2>
						<p className='mt-4 text-muted-foreground'>
							Remote learning created a challenge for maintaining academic
							integrity at scale. Instructors lost confidence in assessment, and
							students faced inconsistent experiences across platforms.
						</p>
						<p className='mt-4 text-muted-foreground'>
							We founded ProctoAI to close that gap — building a secure,
							privacy-first, and student-friendly proctoring system that is both
							accurate and respectful of learners' rights.
						</p>
						<p className='mt-4 text-muted-foreground'>
							Today ProctoAI is used by institutions to deliver reliable
							assessments while giving students clear expectations and
							transparent controls.
						</p>
					</div>
					<div className='mt-8 lg:mt-0'>
						<div className='rounded-lg bg-secondary p-6'>
							<div
								className='h-64 w-full rounded-md bg-secondary/50'
								aria-hidden
							>
								<img
									src='/images/3.png'
									alt='team meeting'
									className='h-64 w-full rounded-md object-cover'
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Our Values */}
			<section className='py-16 bg-secondary/20'>
				<div className='mx-auto max-w-6xl px-6 text-center'>
					<h3 className='text-2xl font-bold'>The Principles That Guide Us</h3>
					<div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
						{values.map((v) => (
							<div key={v.title} className='rounded-xl bg-card p-6 text-left'>
								<div className='flex items-center gap-3'>
									<div className='rounded-md bg-primary/20 p-2'>{v.icon}</div>
									<h4 className='text-lg font-semibold'>{v.title}</h4>
								</div>
								<p className='mt-3 text-muted-foreground text-sm'>{v.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Team */}
			<section className='py-16'>
				<div className='mx-auto max-w-6xl px-6 text-center'>
					<h3 className='text-2xl font-bold'>The Minds Behind ProctoAI</h3>
					<p className='mt-3 text-muted-foreground'>
						A small, cross-functional team combining research, engineering, and
						product expertise.
					</p>

					<div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
						{team.map((m) => (
							<div key={m.name} className='rounded-xl bg-card p-6'>
								<div className='flex flex-col items-center'>
									<div className='h-24 w-24 rounded-full bg-secondary'>
										<img
											src={m.imageurl}
											alt={m.name}
											className='h-24 w-24 rounded-full object-cover'
										/>
									</div>
									<div className='mt-4 text-lg font-semibold'>{m.name}</div>
									<div className='mt-1 text-sm text-muted-foreground'>
										{m.title}
									</div>
									<div className='mt-3'>
										<a
											href={m.linkedin}
											target='_blank'
											rel='noopener noreferrer'
											aria-label='LinkedIn'
											className='text-muted-foreground hover:text-primary transition-colors'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												className='h-5 w-5'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
											>
												<rect
													x='2'
													y='3'
													width='20'
													height='18'
													rx='2'
													ry='2'
													strokeWidth={1.5}
												/>
												<path
													strokeWidth={1.5}
													d='M7 11v5M7 7v.01M11 11v5M16 11v5'
												/>
											</svg>
										</a>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Careers CTA */}
			<section className='py-16 bg-linear-to-tr from-primary to-accent'>
				<div className='mx-auto max-w-4xl px-6 text-center'>
					<h3 className='text-2xl font-bold text-primary-foreground'>
						Help Us Shape the Future
					</h3>
					<p className='mt-3 text-primary-foreground/80'>
						We're always looking for passionate people to join our team. See our
						open positions and help us build a more secure learning environment.
					</p>
					<div className='mt-6'>
						<Link
							href={"/careers" as any}
							className='inline-block rounded-md bg-primary-foreground/10 px-6 py-3 font-semibold text-primary-foreground hover:bg-primary-foreground/20'
						>
							View Careers
						</Link>
					</div>
				</div>
			</section>

			{/* Footer will be included by the global layout */}
		</main>
	);
}
