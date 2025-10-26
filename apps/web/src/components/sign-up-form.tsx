import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { useRouter } from "next/navigation";

export default function SignUpForm({
	onSwitchToSignIn,
	embedded = false,
}: {
	onSwitchToSignIn: () => void;
	embedded?: boolean;
}) {
	const router = useRouter();
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
			userType: "student",
		},
		onSubmit: async ({ value }) => {
			try {
				// create the user
				await authClient.signUp.email({
					email: value.email,
					password: value.password,
					name: value.name,
					userType: value.userType,
				} as any);
				// immediately sign in so server-side session is available
				await authClient.signIn.email(
					{
						email: value.email,
						password: value.password,
					},
					{
						onSuccess: () => {
							if (typeof window !== "undefined")
								window.location.replace("/dashboard");
							else router.replace("/dashboard");
							toast.success("Sign up successful");
						},
						onError: (error) => {
							toast.error(
								error.error.message ||
									error.error.statusText ||
									"Sign in failed after sign up"
							);
						},
					}
				);
			} catch (error) {
				console.error("Sign up / sign in error:", error);
				toast.error("Sign up failed");
			}
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
				userType: z.enum(["student", "instructor"]),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className={embedded ? undefined : "mx-auto w-full mt-10 max-w-md p-6"}>
			{!embedded && (
				<h1 className='mb-6 text-center text-3xl font-bold'>Create Account</h1>
			)}

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className='space-y-4'
			>
				<div>
					<form.Field name='name'>
						{(field) => (
							<div className='space-y-2'>
								<Label htmlFor={field.name}>Name</Label>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className='border-white'
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className='text-destructive'>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name='email'>
						{(field) => (
							<div className='space-y-2'>
								<Label htmlFor={field.name}>Email</Label>
								<Input
									id={field.name}
									name={field.name}
									type='email'
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className='border-white'
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className='text-destructive'>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name='password'>
						{(field) => (
							<div className='space-y-2 border-white'>
								<Label htmlFor={field.name}>Password</Label>
								<Input
									id={field.name}
									name={field.name}
									type='password'
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className='border-white'
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className='text-destructive'>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name='userType'>
						{(field) => (
							<div className='space-y-2'>
								<Label htmlFor={field.name}>User Type</Label>
								<Select
									value={field.state.value}
									onValueChange={(v) => field.handleChange(v)}
								>
									<SelectTrigger id={field.name}>
										<SelectValue placeholder='Select role' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='student'>Student</SelectItem>
										<SelectItem value='instructor'>Instructor</SelectItem>
									</SelectContent>
								</Select>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className='text-destructive'>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<form.Subscribe>
					{(state) => (
						<Button
							type='submit'
							className='w-full'
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? "Submitting..." : "Sign Up"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			{!embedded && (
				<div className='mt-4 text-center'>
					<Button
						variant='link'
						onClick={onSwitchToSignIn}
						className='text-primary hover:text-primary/80'
					>
						Already have an account? Sign In
					</Button>
				</div>
			)}
		</div>
	);
}
