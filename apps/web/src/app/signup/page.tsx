"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SignUpForm from "@/components/sign-up-form";

export default function SignUpPage() {
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
		<div className='container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center '>
			<div className='p-4 lg:p-8'>
				<div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
					<div className='flex flex-col space-y-2 text-center'>
						<h1 className='text-2xl font-semibold tracking-tight'>
							Create your account
						</h1>
						<p className='text-sm text-muted-foreground'>
							Sign up to get started
						</p>
					</div>

					<Card className='border-0 shadow-lg'>
						<CardContent className='pt-6'>
							<SignUpForm
								embedded
								onSwitchToSignIn={() => router.push("/signin")}
							/>
						</CardContent>
					</Card>

					<p className='px-8 text-center text-sm text-muted-foreground'>
						Already have an account?{" "}
						<Link
							href='/signin'
							className='underline underline-offset-4 hover:text-primary'
						>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
