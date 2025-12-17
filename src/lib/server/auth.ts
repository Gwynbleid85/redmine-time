import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

/**
 * Better Auth Server Functions
 * Handles session validation and authentication checks
 */

/**
 * Get current session data using Better Auth API
 */
export const getSessionFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const headers = getRequestHeaders();
		const session = await auth.api.getSession({
			headers,
		});

		return session;
	},
);

/**
 * Check if user has valid Better Auth session
 */
export const checkAuthSessionFn = createServerFn({ method: "GET" }).handler(
	async () => {
		try {
			const headers = getRequestHeaders();
			const session = await auth.api.getSession({
				headers,
			});

			return session ? "true" : "false";
		} catch (error) {
			console.error("Error checking auth session:", error);
			return "false";
		}
	},
);
