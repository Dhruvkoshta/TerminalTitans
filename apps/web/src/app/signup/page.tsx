'use client';

import { useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import Loader from '@/components/loader';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SignUpForm from '@/components/sign-up-form';

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (session) {
      if (typeof window !== 'undefined') window.location.replace('/dashboard');
      else router.replace('/dashboard');
    }
  }, [session, router]);

  if (isPending) return <Loader />;

  return (
    <div className="container relative min-h-[calc(100vh-4rem)] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          PROCTO Portal
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Join the platform that streamlines secure online examinations for all."
            </p>
            <footer className="text-sm">Built for students and educators</footer>
          </blockquote>
        </div>
      </div>

      <div className="p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground">Sign up to get started</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <SignUpForm embedded onSwitchToSignIn={() => router.push('/signin')} />
            </CardContent>
          </Card>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/signin" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

