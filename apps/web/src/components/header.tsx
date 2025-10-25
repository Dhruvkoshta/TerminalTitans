"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { Button } from "./ui/button";

export default function Header() {
	const links = [
		{ to: "/", label: "Home" },
		{ to: "/dashboard", label: "Dashboard" },
		{ to: "/test", label: "Test" },
		{ to: "/exam-instructions", label: "Exam Instructions" },
		{ to: "/id-verification", label: "ID Verification" },
		{ to: "/about", label: "About" },
	] as const;

	return (
		<header className='fixed top-2 left-0 right-0 z-50 h-16'>
			<div className='mx-auto w-full max-w-6xl px-4 h-full'>
				<div className='h-full rounded-2xl bg-slate-900/60 backdrop-blur-md shadow-lg flex items-center justify-between px-4'>
					<div className='flex items-center gap-4'>
						<Link
							href='/'
							className='text-2xl font-bold tracking-tight text-white'
						>
							PROCTO
						</Link>
						<nav className='hidden gap-4 text-base text-purple-100 sm:flex'>
							{links.map(({ to, label }) => (
								<Link
									key={to}
									href={to as any}
									className='hover:text-white transition-colors'
								>
									{label}
								</Link>
							))}
						</nav>
					</div>

					<div className='flex items-center gap-2'>
						<ModeToggle />
						<UserMenu />
						<div className='hidden sm:block'>
							<Button variant='ghost' size='sm' asChild>
								<Link href={"/about" as any}>About</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
