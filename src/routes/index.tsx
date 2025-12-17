import { createFileRoute, redirect } from "@tanstack/react-router";
import { checkAuth } from "@/lib/auth-utils";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		const isAuthenticated = await checkAuth();
		if (isAuthenticated) {
			throw redirect({ to: "/calendar" });
		}
		throw redirect({ to: "/login" });
	},
});
