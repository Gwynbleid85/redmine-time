import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";

/**
 * Auth guard hook that checks if user is logged in
 * Redirects to /login if not authenticated
 * @returns session data and loading state
 */
export function useAuthGuard() {
	const { data: session, isPending } = useSession();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isPending && !session) {
			navigate({ to: "/login" });
		}
	}, [session, isPending, navigate]);

	return {
		session,
		isLoading: isPending,
		isAuthenticated: !!session,
	};
}
