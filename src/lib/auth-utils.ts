import { redirect } from "@tanstack/react-router";
import { checkAuthSessionFn } from "@/lib/server/auth";

/**
 * Centralized Authentication Utilities
 * Following TanStack Router best practices for authentication
 */

/**
 * Check if user is authenticated by verifying Better Auth session
 * @returns Promise<boolean> - true if user has valid session
 */
export async function checkAuth(): Promise<boolean> {
	const hasSession = await checkAuthSessionFn();
	return hasSession === "true";
}

/**
 * Require authentication - redirect to login if not authenticated
 * Use this in beforeLoad for protected routes
 *
 * @throws redirect to "/login" if user is not authenticated
 * @returns Object with isAuthenticated: true
 *
 * @example
 * export const Route = createFileRoute('/calendar')({
 *   beforeLoad: requireAuth,
 *   component: CalendarPage,
 * });
 */
export async function requireAuth() {
	const isAuthenticated = await checkAuth();
	if (!isAuthenticated) {
		throw redirect({ to: "/login" });
	}
	return { isAuthenticated: true };
}

/**
 * Redirect authenticated users away from login page
 * Use this in beforeLoad for public-only routes (like login)
 *
 * @throws redirect to "/calendar" if user is authenticated
 * @returns Object with isAuthenticated: false
 *
 * @example
 * export const Route = createFileRoute('/')({
 *   beforeLoad: redirectIfAuthenticated,
 *   component: LoginPage,
 * });
 */
export async function redirectIfAuthenticated() {
	const isAuthenticated = await checkAuth();
	if (isAuthenticated) {
		throw redirect({ to: "/calendar" });
	}
	return { isAuthenticated: false };
}
