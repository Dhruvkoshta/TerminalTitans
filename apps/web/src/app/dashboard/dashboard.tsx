"use client";
import { authClient } from "@/lib/auth-client";
import InstructorDashboard from "./(instructor)/InstructorDashboard";
import StudentDashboard from "./(student)/StudentDashboard";

export default function Dashboard({
	session,
}: {
	session: typeof authClient.$Infer.Session;
}) {
	// Previously called trpc.privateData; no longer needed here.
	if ((session.user as any)?.userType === "instructor") {
		return <InstructorDashboard session={session} />;
	}
	return <StudentDashboard session={session} />;
}
