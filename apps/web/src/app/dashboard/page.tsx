import { redirect } from "next/navigation";
import Dashboard from "./dashboard";
import { headers } from "next/headers";
import { auth } from "@my-better-t-app/auth";
import { authClient } from "@/lib/auth-client";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<>
			<div className='flex justify-center items-center'>
				<Dashboard session={session} />
			</div>
		</>
	);
}
