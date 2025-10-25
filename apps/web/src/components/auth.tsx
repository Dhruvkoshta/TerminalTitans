"use client";
import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loader from "./loader";

// Small reusable input component moved to top-level to avoid remounting on every render
const Input = ({
	label,
	type = "text",
	value,
	onChange,
	autoComplete,
	children,
}: any) => (
	<label className='block text-sm'>
		<div className='mb-2 text-sm text-slate-300'>{label}</div>
		<div className='relative'>
			<input
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				autoComplete={autoComplete}
				className='w-full rounded-md bg-slate-800/60 border border-slate-700/60 px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500'
			/>
			{children}
		</div>
	</label>
);

type View = "signup" | "signin" | "forgot" | "resetSent";

export default function App({ initialView }: { initialView?: View } = {}) {
	const [view, setView] = useState<View>(initialView ?? "signin");
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const { isPending } = authClient.useSession();

	// Common fields
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	// Signup-specific
	const [name, setName] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [userType, setUserType] = useState<"student" | "instructor">("student");

	// Forgot
	const [forgotEmail, setForgotEmail] = useState("");

	// Placeholder handlers
	async function handleSignUp(e?: React.FormEvent) {
		e?.preventDefault();
		setError(null);
		// Basic validation placeholder
		if (!name || !email || !password || !confirmPassword) {
			setError("Please fill all fields.");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		try {
			// create the user
			await authClient.signUp.email({
				email,
				password,
				name,
				userType,
			} as any);
			// immediately sign in so server-side session is available
			await authClient.signIn.email(
				{
					email,
					password,
				},
				{
					onSuccess: () => {
						if (typeof window !== "undefined")
							window.location.href = "/dashboard";
						else router.push("/dashboard");
						toast.success("Sign up successful");
					},
					onError: (err) => {
						toast.error(
							err.error?.message ||
								err.error?.statusText ||
								"Sign in failed after sign up"
						);
					},
				}
			);
		} catch (err) {
			console.error("Sign up / sign in error:", err);
			toast.error("Sign up failed");
		}
	}

	async function handleSignIn(e?: React.FormEvent) {
		e?.preventDefault();
		setError(null);
		if (!email || !password) {
			setError("Please enter email and password.");
			return;
		}
		try {
			await authClient.signIn.email(
				{
					email,
					password,
				},
				{
					onSuccess: () => {
						toast.success("Sign in successful");
						if (typeof window !== "undefined")
							window.location.href = "/dashboard";
						else router.push("/dashboard");
					},
					onError: (err) => {
						toast.error(
							err.error?.message || err.error?.statusText || "Sign in failed"
						);
					},
				}
			);
		} catch (err) {
			console.error("Sign in error:", err);
			toast.error("Sign in failed");
		}
	}

	async function handleSendReset(e?: React.FormEvent) {
		e?.preventDefault();
		setError(null);
		if (!forgotEmail) {
			setError("Please enter your email.");
			return;
		}
		try {
			const res = await fetch("/api/auth/forget-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: forgotEmail }),
			});
			if (res.ok) {
				toast.success("If this email exists, a reset link was sent");
				setView("resetSent");
			} else {
				const data = await res.json().catch(() => null);
				toast.error(data?.message || "Failed to send reset email");
			}
		} catch (err) {
			console.error("Forgot password error:", err);
			toast.error("Failed to send reset email");
		}
	}

	// Inline heroicons (simple versions)
	const Eye = ({ open }: { open?: boolean }) => (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className='h-5 w-5'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
		>
			{open ? (
				<path
					strokeWidth={1.5}
					strokeLinecap='round'
					strokeLinejoin='round'
					d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
				/>
			) : (
				<>
					<path
						strokeWidth={1.5}
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z'
					/>
					<path
						strokeWidth={1.5}
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M22 2L2 22'
					/>
				</>
			)}
		</svg>
	);

	const GoogleIcon = () => (
		<svg
			className='h-5 w-5'
			viewBox='0 0 533.5 544.3'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				fill='#4285f4'
				d='M533.5 278.4c0-17.4-1.6-34-4.7-50.2H272v95.1h147.3c-6.4 34.7-25.6 64.1-54.6 83.8v69.6h88.1c51.6-47.5 81.7-117.6 81.7-198.3z'
			/>
			<path
				fill='#34a853'
				d='M272 544.3c73.8 0 135.8-24.5 181.1-66.6l-88.1-69.6c-24.5 16.5-55.8 26.2-93 26.2-71.4 0-132.1-48.1-153.8-112.7H28.6v70.7C73 480.2 167.3 544.3 272 544.3z'
			/>
			<path
				fill='#fbbc04'
				d='M118.2 323.6c-10.5-31.2-10.5-64.8 0-96l-89.6-70.7C6.7 184 0 226 0 272s6.7 88 28.6 115.1l89.6-70.7z'
			/>
			<path
				fill='#ea4335'
				d='M272 107.3c39 0 74 13.5 101.5 40.1l76.1-76.1C411.5 24.3 345.8 0 272 0 167.3 0 73 64.1 28.6 163.6l89.6 70.7C139.9 155.4 200.6 107.3 272 107.3z'
			/>
		</svg>
	);

	const MicrosoftIcon = () => (
		<svg
			className='h-5 w-5'
			viewBox='0 0 24 24'
			xmlns='http://www.w3.org/2000/svg'
		>
			<rect x='1' y='1' width='10' height='10' fill='#f35325' />
			<rect x='13' y='1' width='10' height='10' fill='#81bc06' />
			<rect x='1' y='13' width='10' height='10' fill='#05a6f0' />
			<rect x='13' y='13' width='10' height='10' fill='#ffba08' />
		</svg>
	);
	// Small reusable input component moved to top-level to avoid remounting on every render

	return (
		<div className='min-h-screen flex items-center justify-center bg-slate-900'>
			<div className='w-full max-w-md rounded-2xl bg-slate-900/60 p-8 shadow-lg ring-1 ring-slate-700'>
				<div className='mb-6 text-center'>
					<div className='mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-linear-to-br from-purple-600 to-indigo-600 text-white font-extrabold'>
						P
					</div>
					<h1 className='mt-4 text-2xl font-extrabold text-white'>PROCTO</h1>
				</div>

				{error && (
					<div className='mb-4 rounded-md bg-red-900/60 p-3 text-sm text-red-200'>
						{error}
					</div>
				)}

				{isPending && (
					<div className='mb-4'>
						<Loader />
					</div>
				)}

				{view === "signup" && (
					<form onSubmit={handleSignUp} className='space-y-4'>
						<h2 className='text-lg font-semibold text-white'>Create Account</h2>
						<Input label='Name' value={name} onChange={setName} />
						<Input
							label='Email'
							value={email}
							onChange={setEmail}
							type='email'
							autoComplete='email'
						/>
						<div>
							<div className='flex items-center justify-between'>
								<label className='mb-2 text-sm text-slate-300'>Password</label>
							</div>
							<div className='relative'>
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className='w-full rounded-md bg-slate-800/60 border border-slate-700/60 px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500'
								/>
								<button
									type='button'
									onClick={() => setShowPassword((s) => !s)}
									className='absolute right-2 top-2 text-slate-300'
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									<Eye open={showPassword} />
								</button>
							</div>
						</div>

						<div>
							<div className='flex items-center justify-between'>
								<label className='mb-2 text-sm text-slate-300'>
									Confirm Password
								</label>
							</div>
							<div className='relative'>
								<input
									type={showPassword ? "text" : "password"}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className='w-full rounded-md bg-slate-800/60 border border-slate-700/60 px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500'
								/>
							</div>
						</div>

						<div>
							<label className='block text-sm text-slate-300 mb-2'>
								User Type
							</label>
							<select
								value={userType}
								onChange={(e) => setUserType(e.target.value as any)}
								className='w-full rounded-md bg-slate-800/60 border border-slate-700/60 px-3 py-2 text-white'
							>
								<option value='student'>Student</option>
								<option value='instructor'>Instructor</option>
							</select>
						</div>

						<button
							type='submit'
							className='w-full rounded-md bg-purple-600 py-2 text-white font-medium'
						>
							Sign Up
						</button>

						<div className='grid gap-2'>
							<button
								type='button'
								onClick={() => console.log("google signup")}
								className='flex items-center justify-center gap-2 rounded-md border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-white'
							>
								<GoogleIcon /> <span>Continue with Google</span>
							</button>
							<button
								type='button'
								onClick={() => console.log("microsoft signup")}
								className='flex items-center justify-center gap-2 rounded-md border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-white'
							>
								<MicrosoftIcon /> <span>Continue with Microsoft</span>
							</button>
						</div>

						<div className='text-center text-sm text-slate-400'>
							Already have an account?{" "}
							<button
								type='button'
								className='text-white font-medium'
								onClick={() => setView("signin")}
							>
								Sign In
							</button>
						</div>
					</form>
				)}

				{view === "signin" && (
					<form onSubmit={handleSignIn} className='space-y-4'>
						<h2 className='text-lg font-semibold text-white'>Welcome Back</h2>
						<Input
							label='Email'
							value={email}
							onChange={setEmail}
							type='email'
							autoComplete='email'
						/>

						<div>
							<div className='flex items-center justify-between'>
								<label className='mb-2 text-sm text-slate-300'>Password</label>
								<div className='flex items-center gap-4'>
									<label className='inline-flex items-center text-sm text-slate-400'>
										<input type='checkbox' className='mr-2' /> Remember me
									</label>
								</div>
							</div>
							<div className='relative'>
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className='w-full rounded-md bg-slate-800/60 border border-slate-700/60 px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500'
								/>
								<button
									type='button'
									onClick={() => setShowPassword((s) => !s)}
									className='absolute right-2 top-2 text-slate-300'
									aria-label='Toggle password visibility'
								>
									<Eye open={showPassword} />
								</button>
							</div>
						</div>

						<div className='flex items-center justify-between'>
							<div />
							<button
								type='button'
								onClick={() => setView("forgot")}
								className='text-sm text-purple-300'
							>
								Forgot password?
							</button>
						</div>

						<button
							type='submit'
							className='w-full rounded-md bg-purple-600 py-2 text-white font-medium'
						>
							Sign In
						</button>

						<div className='grid gap-2'>
							<button
								type='button'
								onClick={() => console.log("google signin")}
								className='flex items-center justify-center gap-2 rounded-md border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-white'
							>
								<GoogleIcon /> <span>Continue with Google</span>
							</button>
							<button
								type='button'
								onClick={() => console.log("microsoft signin")}
								className='flex items-center justify-center gap-2 rounded-md border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-white'
							>
								<MicrosoftIcon /> <span>Continue with Microsoft</span>
							</button>
						</div>

						<div className='text-center text-sm text-slate-400'>
							Don't have an account?{" "}
							<button
								type='button'
								className='text-white font-medium'
								onClick={() => setView("signup")}
							>
								Sign Up
							</button>
						</div>
					</form>
				)}

				{view === "forgot" && (
					<form onSubmit={handleSendReset} className='space-y-4'>
						<h2 className='text-lg font-semibold text-white'>
							Forgot Password
						</h2>
						<p className='text-sm text-slate-400'>
							No worries, we'll send you reset instructions.
						</p>
						<Input
							label='Email'
							value={forgotEmail}
							onChange={setForgotEmail}
							type='email'
							autoComplete='email'
						/>
						<button
							type='submit'
							className='w-full rounded-md bg-purple-600 py-2 text-white font-medium'
						>
							Send Reset Link
						</button>
						<div className='text-center text-sm text-slate-400'>
							<button
								type='button'
								className='text-white font-medium'
								onClick={() => setView("signin")}
							>
								Back to Sign In
							</button>
						</div>
					</form>
				)}

				{view === "resetSent" && (
					<div className='space-y-4'>
						<h2 className='text-lg font-semibold text-white'>
							Check your email
						</h2>
						<p className='text-sm text-slate-400'>
							We've sent password reset instructions to your email address.
						</p>
						<div className='flex gap-2'>
							<button
								onClick={() => setView("signin")}
								className='w-full rounded-md bg-purple-600 py-2 text-white font-medium'
							>
								Back to Sign In
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
