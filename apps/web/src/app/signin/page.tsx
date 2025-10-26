"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SignInForm from "@/components/sign-in-form";

export default function SignInPage() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (session) {
			if (typeof window !== "undefined") window.location.replace("/dashboard");
			else router.replace("/dashboard");
		}
	}, [session, router]);

	if (isPending) return <Loader />;

	return (
		<div className='container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center items-middle'>
			<div className='p-4 lg:p-8'>
				<div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
					<div className='flex flex-col space-y-2 text-center'>
						<h1 className='text-2xl font-semibold tracking-tight'>
							Welcome Back
						</h1>
						<p className='text-sm text-muted-foreground'>
							Sign in to access your dashboard
						</p>
					</div>

					<Card className='border-0 shadow-lg'>
						<CardContent className='pt-6'>
							<SignInForm
								embedded
								onSwitchToSignUp={() => router.push("/signup")}
							/>
						</CardContent>
					</Card>

					<p className='px-8 text-center text-sm text-muted-foreground'>
						New to ProctoAI?{" "}
						<Link
							href='/signup'
							className='underline underline-offset-4 hover:text-primary'
						>
							Create an account
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
