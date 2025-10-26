"use client";

import Image from "next/image";
import Link from "next/link";
import {
	motion,
	useMotionTemplate,
	useScroll,
	useTransform,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, X, Facebook, Twitter, Instagram } from "lucide-react";

export default function Home() {
	return (
		<main className='flex min-h-screen flex-col bg-background text-foreground'>
			<Hero />
			<Brands />
			<Benefits />
			<Features />
			<Plugins />
			<Insights />
			<Testimonials />
			<Faq />
			<Newsletter />
			<Footer />
		</main>
	);
}

function Reveal({
	children,
	delay = 0,
}: {
	children: ReactNode;
	delay?: number;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.2 }}
			transition={{ duration: 0.6, ease: "easeOut", delay }}
		>
			{children}
		</motion.div>
	);
}

function Hero() {
	const ref = useRef<HTMLDivElement | null>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});
	const rotateX = useTransform(scrollYProgress, [0, 0.6], [70, 0]);
	const scale = useTransform(scrollYProgress, [0, 0.6], [0.8, 1]);
	const translateY = useTransform(scrollYProgress, [0, 0.6], [12, 0]);
	const shadowAlpha = useTransform(scrollYProgress, [0.5, 0.8], [0, 0.66]);
	const boxShadow = useMotionTemplate`0px 15px 25px -5px rgba(126, 34, 206, ${shadowAlpha})`;
	const transform = useMotionTemplate`perspective(1200px) translateY(${translateY}px) scale(${scale}) rotateX(${rotateX}deg)`;

	return (
		<section
			ref={ref}
			className='relative flex min-h-screen w-full max-w-[100vw] flex-col overflow-hidden '
			id='hero-section'
		>
			<div className='flex h-full min-h-screen w-full flex-col items-center justify-center gap-10 p-[5%] lg:gap-14'>
				<div className='flex flex-col items-center text-center'>
					<Reveal>
						<h1 className='bg-linear-to-r from-foreground via-primary to-accent bg-clip-text text-6xl font-semibold uppercase tracking-tight text-transparent max-lg:text-4xl'>
							The Future of
							<br />
							Exam Integrity
						</h1>
					</Reveal>
					<Reveal delay={0.1}>
						<p className='mt-6 max-w-xl text-balance text-base text-muted-foreground'>
							Revolutionize online exams with AI-powered proctoring that ensures
							fairness, security, and integrity for educational institutions
							worldwide.
						</p>
					</Reveal>
					<div className='mt-10 flex flex-wrap items-center justify-center gap-4'>
						<Reveal>
							<Link
								className='inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground backdrop-blur transition-transform duration-300 hover:scale-[1.03] hover:bg-secondary'
								href='/#'
							>
								Get started
							</Link>
						</Reveal>
						<Reveal delay={0.05}>
							<Link
								className='inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background'
								href='/#'
							>
								Learn more
							</Link>
						</Reveal>
					</div>
				</div>

				<div className='relative flex w-full justify-center'>
					<motion.div
						style={{ transform, boxShadow }}
						className='relative max-w-[80%] overflow-hidden rounded-2xl border border-border bg-card backdrop-blur max-md:max-w-full'
					>
						<Image
							src='/assets/images/home/dashboard.png'
							alt='dashboard'
							width={1400}
							height={800}
							className='h-full w-full object-cover opacity-90'
							priority
						/>
					</motion.div>
					<div className='pointer-events-none absolute left-[20%] top-5 h-[200px] w-[200px] rounded-full bg-fuchsia-500/30 blur-[120px]' />
					<div className='pointer-events-none absolute right-[15%] bottom-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-[100px]' />
				</div>
			</div>
		</section>
	);
}

function Brands() {
	const logos = ["google", "microsoft", "adobe", "airbnb", "stripe", "reddit"];

	return (
		<section className='flex w-full flex-col items-center overflow-hidden px-[5%] py-12'>
			<h2 className='text-3xl font-semibold text-foreground/90 max-md:text-xl'>
				Trusted by brands you know
			</h2>
			<div className='mt-8 w-full max-w-4xl'>
				<motion.div
					className='flex w-full gap-8'
					animate={{ x: [0, -300] }}
					transition={{
						repeat: Infinity,
						repeatType: "loop",
						ease: "linear",
						duration: 15,
					}}
				>
					{[...logos, ...logos].map((logo, index) => (
						<div
							key={`${logo}-${index}`}
							className='h-[30px] w-[150px] shrink-0'
						>
							<Image
								src={`/assets/images/brand-logos/${logo}.svg`}
								alt={logo}
								width={150}
								height={30}
								className='h-full w-full object-contain grayscale transition duration-300 hover:grayscale-0'
							/>
						</div>
					))}
				</motion.div>
			</div>
		</section>
	);
}

function Benefits() {
	const items = [
		{
			icon: "🛡️",
			title: "Prevent cheating effectively",
			text: "Advanced AI detection stops unauthorized behavior during exams.",
		},
		{
			icon: "📹",
			title: "Real-time monitoring",
			text: "Continuous surveillance ensures exam integrity from start to finish.",
		},
		{
			icon: "⚡",
			title: "Instant alerts",
			text: "Get notified immediately of any suspicious activities.",
		},
	];

	return (
		<section className='flex w-full flex-col items-center px-[5%] py-16'>
			<Reveal>
				<div className='text-center'>
					<p className='text-sm uppercase tracking-[0.4em] text-muted-foreground/50'>
						Benefits
					</p>
					<h2 className='mt-3 text-4xl font-semibold text-foreground max-md:text-3xl'>
						Why choose ProctoAI?
					</h2>
				</div>
			</Reveal>
			<div className='mt-12 grid w-full max-w-5xl grid-cols-1 gap-10 md:grid-cols-3'>
				{items.map((item, index) => (
					<Reveal key={item.title} delay={index * 0.05}>
						<div className='flex h-full flex-col gap-6 rounded-2xl border border-border bg-card p-6 text-center'>
							<div className='flex h-48 items-center justify-center rounded-xl border border-border bg-secondary text-6xl max-md:text-5xl'>
								<span aria-hidden>{item.icon}</span>
							</div>
							<h3 className='text-2xl font-medium text-foreground'>
								{item.title}
							</h3>
							<p className='text-sm text-muted-foreground'>{item.text}</p>
						</div>
					</Reveal>
				))}
			</div>
		</section>
	);
}

function Features() {
	const items = [
		{
			icon: "🤖",
			title: "AI-Powered Detection",
			text: "Machine learning algorithms identify cheating patterns in real-time.",
		},
		{
			icon: "📊",
			title: "Comprehensive Analytics",
			text: "Detailed reports on exam sessions and student behavior.",
		},
		{
			icon: "☁️",
			title: "Cloud-Based Security",
			text: "Secure, scalable infrastructure for online proctoring.",
		},
		{
			icon: "🔒",
			title: "Multi-Factor Authentication",
			text: "Enhanced security with biometric and device verification.",
		},
		{
			icon: "🎚️",
			title: "Seamless Integrations",
			text: "Works with popular LMS platforms like Canvas and Moodle.",
		},
		{
			icon: "⚙️",
			title: "Customizable Settings",
			text: "Tailor proctoring rules to your institution's needs.",
		},
	];

	return (
		<section className='flex w-full flex-col items-center px-[5%] py-20'>
			<Reveal>
				<h2 className='text-center text-4xl font-semibold text-foreground max-md:text-3xl'>
					Advanced Proctoring Features
				</h2>
			</Reveal>
			<div className='mt-12 grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-2'>
				{items.map((item, index) => (
					<Reveal key={item.title} delay={index * 0.05}>
						<div className='flex gap-6 rounded-2xl border border-border bg-card p-6'>
							<div className='text-4xl' aria-hidden>
								{item.icon}
							</div>
							<div className='flex flex-col gap-3'>
								<h3 className='text-2xl font-medium text-foreground'>
									{item.title}
								</h3>
								<p className='text-sm text-muted-foreground'>{item.text}</p>
							</div>
						</div>
					</Reveal>
				))}
			</div>
		</section>
	);
}

function Plugins() {
	return (
		<section className='flex w-full flex-col items-center px-[5%] py-20'>
			<div className='flex w-full flex-col items-center gap-10 lg:flex-row'>
				<Reveal>
					<div className='max-h-[650px] max-w-[850px] overflow-hidden rounded-2xl border border-primary/30 shadow-[0_0_60px_-15px_rgba(15,164,175,0.44)]'>
						<Image
							src='/assets/images/home/dash.png'
							alt='Plugin preview'
							width={1200}
							height={700}
							className='h-full w-full object-cover'
						/>
					</div>
				</Reveal>
				<div className='max-w-lg space-y-6 text-left'>
					<Reveal>
						<h3 className='text-4xl font-semibold text-foreground max-md:text-3xl'>
							AI-Powered Proctoring Tools
						</h3>
					</Reveal>
					<Reveal>
						<div className='space-y-3 text-muted-foreground'>
							<h4 className='text-xl font-medium text-foreground'>
								Face Recognition
							</h4>
							<p>
								Verify student identity with advanced facial recognition
								technology.
							</p>
						</div>
					</Reveal>
					<Reveal>
						<div className='space-y-3 text-muted-foreground'>
							<h4 className='text-xl font-medium text-foreground'>
								Behavior Analysis
							</h4>
							<p>
								Monitor eye movement, head position, and suspicious activities.
							</p>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}

function Insights() {
	return (
		<section className='flex w-full flex-col items-center px-[5%] py-20'>
			<div className='flex w-full flex-col items-center gap-10 lg:flex-row-reverse'>
				<Reveal>
					<div className='max-h-[650px] max-w-[850px] overflow-hidden rounded-2xl border border-primary/30 shadow-[0_0_60px_-15px_rgba(15,164,175,0.44)]'>
						<Image
							src='/assets/images/home/insights.png'
							alt='Insights'
							width={1200}
							height={700}
							className='h-full w-full object-cover'
						/>
					</div>
				</Reveal>
				<div className='max-w-lg space-y-6 text-left'>
					<Reveal>
						<h3 className='text-4xl font-semibold text-foreground max-md:text-3xl'>
							Comprehensive Exam Analytics
						</h3>
					</Reveal>
					<Reveal>
						<div className='space-y-3 text-muted-foreground'>
							<h4 className='text-xl font-medium text-foreground'>
								Detailed Reports
							</h4>
							<p>
								Get in-depth analysis of each exam session with timestamps and
								flags.
							</p>
						</div>
					</Reveal>
					<Reveal>
						<div className='space-y-3 text-muted-foreground'>
							<h4 className='text-xl font-medium text-foreground'>
								Unified Dashboard
							</h4>
							<p>Monitor all exams from a single, intuitive interface.</p>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}

function Testimonials() {
	const cards = [
		{
			img: "/assets/images/people/women.jpg",
			name: "Trich B",
			title: "AMI, CEO",
			text: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Beatae, vero.",
		},
		{
			img: "/assets/images/people/man.jpg",
			name: "John B",
			title: "ABC, CTO",
			text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore deserunt delectus consectetur enim.",
		},
		{
			img: "/assets/images/people/man2.jpg",
			name: "Mante",
			title: "XYZ, CTO",
			text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem, numquam.",
		},
		{
			img: "/assets/images/people/women.jpg",
			name: "Lara",
			title: "XZ, CTO",
			text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta saepe illum.",
		},
		{
			img: "/assets/images/people/man.jpg",
			name: "James",
			title: "App, CTO",
			text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga accusamus non enim debitis.",
		},
		{
			img: "/assets/images/people/man2.jpg",
			name: "Ron",
			title: "Marketplace, CTO",
			text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga accusamus non enim debitis.",
		},
	];

	return (
		<section className='flex w-full flex-col items-center px-[5%] py-20'>
			<Reveal>
				<h3 className='text-4xl font-semibold text-foreground max-md:text-3xl'>
					Trusted by Educational Institutions
				</h3>
			</Reveal>
			<div className='mt-12 columns-1 gap-8 space-y-8 md:columns-2 xl:columns-3'>
				{cards.map((card, index) => (
					<Reveal key={card.name} delay={index * 0.03}>
						<div className='flex h-full w-[340px] break-inside-avoid flex-col gap-4 rounded-2xl border border-border bg-card p-6 max-lg:w-[320px]'>
							<p className='text-sm text-muted-foreground'>{card.text}</p>
							<div className='flex items-center gap-3'>
								<div className='h-12 w-12 overflow-hidden rounded-full'>
									<Image
										src={card.img}
										alt={card.name}
										width={48}
										height={48}
										className='h-full w-full object-cover'
									/>
								</div>
								<div className='flex flex-col'>
									<span className='font-semibold text-foreground'>
										{card.name}
									</span>
									<span className='text-xs text-muted-foreground/60'>
										{card.title}
									</span>
								</div>
							</div>
						</div>
					</Reveal>
				))}
			</div>
		</section>
	);
}

function Pricing() {
	const tiers = [
		{
			price: 9,
			featured: false,
			desc: "Perfect for small institutions starting with online proctoring.",
			features: [
				"Up to 100 students",
				"Basic AI monitoring",
				"Email support",
				"Standard reports",
			],
		},
		{
			price: 19,
			featured: true,
			desc: "Ideal for growing universities with advanced needs.",
			features: [
				"Up to 1000 students",
				"Advanced AI detection",
				"Priority support",
				"Detailed analytics",
			],
		},
		{
			price: 49,
			featured: false,
			desc: "For large institutions requiring enterprise solutions.",
			features: [
				"Unlimited students",
				"Full AI suite",
				"Dedicated support",
				"Custom integrations",
			],
		},
	];

	return (
		<section
			className='flex w-full flex-col items-center px-[5%] py-20'
			id='pricing'
		>
			<Reveal>
				<h3 className='text-3xl font-semibold text-foreground/90 max-md:text-2xl'>
					Simple pricing
				</h3>
			</Reveal>
			<div className='mt-12 flex w-full flex-wrap justify-center gap-8'>
				{tiers.map((tier, index) => (
					<Reveal key={tier.price} delay={index * 0.05}>
						<div
							className={`flex w-[360px] flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center shadow-xl transition-transform duration-300 hover:scale-[1.02] max-lg:w-[320px] ${
								tier.featured ? "border-primary/60" : "border-border"
							}`}
						>
							<h3 className='text-5xl font-semibold text-foreground'>
								${tier.price}
								<span className='ml-1 text-2xl text-muted-foreground/60'>
									/mo
								</span>
							</h3>
							<p className='text-sm text-muted-foreground'>{tier.desc}</p>
							<hr className='w-full border-border' />
							<ul className='flex w-full flex-col gap-2 text-sm text-muted-foreground'>
								{tier.features.map((feature, i) => (
									<li key={i}>{feature}</li>
								))}
							</ul>
							<Link
								href='/#'
								className='mt-6 inline-flex w-full items-center justify-center rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-foreground transition-transform duration-300 hover:translate-y-1'
							>
								Get now
							</Link>
						</div>
					</Reveal>
				))}
			</div>
		</section>
	);
}

function Faq() {
	const items = [
		{
			q: "How does ProctoAI ensure exam integrity?",
			a: "Our AI-powered system uses facial recognition, behavior analysis, and real-time monitoring to detect and prevent cheating.",
		},
		{
			q: "Is ProctoAI compatible with our LMS?",
			a: "Yes, we integrate seamlessly with popular platforms like Canvas, Moodle, and Blackboard.",
		},
		{
			q: "What happens if suspicious activity is detected?",
			a: "Instructors receive instant alerts and can review flagged incidents with detailed timestamps and evidence.",
		},
		{
			q: "How secure is student data?",
			a: "We use enterprise-grade encryption and comply with GDPR and FERPA privacy standards.",
		},
	];

	return (
		<section className='flex w-full flex-col items-center px-[5%] py-20'>
			<Reveal>
				<h3 className='text-4xl font-semibold text-foreground max-md:text-3xl'>
					FAQ
				</h3>
			</Reveal>
			<div className='mt-10 flex w-full max-w-3xl flex-col gap-4'>
				{items.map((item, index) => (
					<Reveal key={item.q} delay={index * 0.04}>
						<details className='rounded-2xl border border-border bg-card transition-colors open:bg-secondary'>
							<summary className='cursor-pointer select-none list-none rounded-2xl px-6 py-4 text-lg font-medium text-foreground'>
								{item.q}
							</summary>
							<div className='px-6 pb-6 text-sm text-muted-foreground'>
								{item.a}
							</div>
						</details>
					</Reveal>
				))}
			</div>
			<Reveal>
				<div className='mt-16 flex flex-col items-center gap-4'>
					<p className='text-2xl text-foreground'>Still have questions?</p>
					<Link
						href='/#'
						className='inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary hover:text-background'
					>
						Contact
					</Link>
				</div>
			</Reveal>
		</section>
	);
}

function Newsletter() {
	return (
		<section className='flex w-full flex-col items-center px-[5%] py-20'>
			<div className='flex w-full max-w-4xl flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-card p-8 lg:flex-row'>
				<Reveal>
					<div className='max-w-md space-y-2 text-center lg:text-left'>
						<h2 className='text-3xl font-semibold text-foreground max-md:text-2xl'>
							Join our newsletter
						</h2>
						<p className='text-sm text-muted-foreground'>
							Get the latest updates on AI proctoring technology and exam
							integrity solutions.
						</p>
					</div>
				</Reveal>
				<Reveal>
					<form className='flex h-14 w-full max-w-md items-center gap-2 rounded-full border border-border bg-background px-2 py-1'>
						<input
							type='email'
							className='h-full flex-1 rounded-full bg-transparent px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none'
							placeholder='email'
							aria-label='Email address'
						/>
						<button
							type='submit'
							className='inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-background transition-transform duration-300 hover:translate-x-1'
						>
							Signup
						</button>
					</form>
				</Reveal>
			</div>
		</section>
	);
}

function Footer() {
	return (
		<footer className='mt-auto w-full px-[5%] pb-10'>
			<div className='flex flex-col justify-between gap-10 rounded-2xl border-t border-border pt-12 lg:flex-row'>
				<div className='flex w-full max-w-xs flex-col items-start gap-5 text-muted-foreground'>
					<Image
						src='/assets/logo/logo.png'
						alt='logo'
						width={120}
						height={120}
						className='max-w-[120px]'
					/>
					<p>
						2 Lord Edward St,
						<br />
						D02 P634,
						<br />
						United States
					</p>
					<div>
						<div className='text-lg font-semibold text-foreground'>
							Follow us
						</div>
						<div className='mt-3 flex gap-4 text-muted-foreground'>
							<Link
								href='/#'
								aria-label='Facebook'
								className='transition-colors hover:text-foreground'
							>
								<Facebook className='h-5 w-5' />
							</Link>
							<Link
								href='https://twitter.com/@pauls_freeman'
								aria-label='Twitter'
								className='transition-colors hover:text-foreground'
							>
								<Twitter className='h-5 w-5' />
							</Link>
							<Link
								href='https://instagram.com/'
								aria-label='Instagram'
								className='transition-colors hover:text-foreground'
							>
								<Instagram className='h-5 w-5' />
							</Link>
						</div>
					</div>
				</div>
				<div className='grid flex-1 grid-cols-1 gap-10 text-muted-foreground sm:grid-cols-2 lg:grid-cols-3'>
					<div className='flex flex-col gap-3'>
						<h2 className='text-2xl font-semibold text-foreground'>Company</h2>
						<Link
							href='/#'
							className='text-sm transition-colors hover:text-foreground'
						>
							Use cases
						</Link>
						<Link
							href='/#'
							className='text-sm transition-colors hover:text-foreground'
						>
							Integrations
						</Link>
						<Link
							href='/#'
							className='text-sm transition-colors hover:text-foreground'
						>
							Change logs
						</Link>
						<Link
							href='/#'
							className='text-sm transition-colors hover:text-foreground'
						>
							Blogs
						</Link>
						<Link
							href='/#'
							className='text-sm transition-colors hover:text-foreground'
						>
							Contact
						</Link>
					</div>
					<div className='flex flex-col gap-3'>
						<h2 className='text-2xl font-semibold text-foreground'>
							Resources
						</h2>
						<Link
							href='/#'
							className='text-sm transition-colors hover:text-foreground'
						>
							About us
						</Link>
						<Link
							href='/#'
							className='text-sm transition-colors hover:text-foreground'
						>
							FAQ
						</Link>
						<Link
							href='/#'
							className='text-sm transition-colors hover:text-foreground'
						>
							Contact Us
						</Link>
						<Link
							href='/#'
							className='text-sm transition-colors hover:text-foreground'
						>
							Blogs
						</Link>
						<Link
							href='/#'
							className='text-sm transition-colors hover:text-foreground'
						>
							Privacy policy
						</Link>
					</div>
					<div className='flex flex-col gap-3'>
						<h2 className='text-2xl font-semibold text-foreground'>Product</h2>
						<Link
							href='/#'
							className='text-sm transition-colors hover:text-foreground'
						>
							Solutions
						</Link>
						<Link
							href='/#'
							className='text-sm transition-colors hover:text-foreground'
						>
							Features
						</Link>
						<Link
							href='/#'
							className='text-sm transition-colors hover:text-foreground'
						>
							Pricing
						</Link>
						<Link
							href='/#'
							className='text-sm transition-colors hover:text-foreground'
						>
							Updates
						</Link>
						<Link
							href='/#'
							className='text-sm transition-colors hover:text-foreground'
						>
							Support
						</Link>
					</div>
				</div>
			</div>
			<div className='mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground lg:flex-row'>
				<span>
					© {new Date().getFullYear()} ProctoAI • All rights reserved.
				</span>
				<span className='flex items-center gap-2'>
					<span className='h-2 w-2 rounded-full bg-emerald-400' />
					All systems nominal
				</span>
			</div>
		</footer>
	);
}
