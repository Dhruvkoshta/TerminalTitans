"use client";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import InstructorDashboard from "./(instructor)/InstructorDashboard";
import StudentDashboard from "./(student)/StudentDashboard";

export default function Dashboard({
	session,
}: {
	session: typeof authClient.$Infer.Session;
}) {
	useQuery(trpc.privateData.queryOptions());

	// userType is provided via Better Auth additionalFields, but may not be reflected in TS here
	if ((session.user as any)?.userType === "instructor") {
		return <InstructorDashboard session={session} />;
	}
	return <StudentDashboard session={session} />;
}
