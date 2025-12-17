import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

/**
 * API Key Management Server Functions
 * Handles Redmine API key storage and validation
 */

/**
 * Helper to get current session
 */
async function getSession() {
	const headers = getRequestHeaders();
	return auth.api.getSession({ headers });
}

/**
 * Check if API key exists for the current user
 */
export const checkApiKeyServerFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		return session?.user?.redmineApiKey ? "true" : "false";
	},
);

/**
 * Get the stored API key for the current user (for internal use)
 */
export const getApiKeyServerFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<string | null> => {
		const session = await getSession();
		return session?.user?.redmineApiKey ?? null;
	},
);

/**
 * Validate API key with Redmine and store in database
 */
export const validateAndSetApiKeyFn = createServerFn({ method: "POST" })
	.inputValidator((data: string) => data)
	.handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
		const session = await getSession();
		const userId = session?.user?.id;

		if (!userId) {
			return {
				success: false,
				error: "You must be logged in to set an API key.",
			};
		}

		const baseUrl = process.env.REDMINE_BASE_URL;

		if (!baseUrl) {
			return {
				success: false,
				error:
					"Redmine base URL is not configured. Please contact administrator.",
			};
		}

		// Validate the API key by calling Redmine /users/current.json endpoint
		console.log(`${baseUrl}/users/current.json`);
		console.log("Validating API key: ", data);

		try {
			// TODO: Uncomment to enable actual validation

			// const response = await fetch(`${baseUrl}/users/current.json`, {
			// 	method: "GET",
			// 	headers: {
			// 		"X-Redmine-API-Key": data,
			// 		Accept: "application/json",
			// 	},
			// });

			// console.log("Token validation response: ", response);

			// if (!response.ok) {
			// 	if (response.status === 401) {
			// 		return {
			// 			success: false,
			// 			error:
			// 				"Invalid API key. Please check your Redmine API key and try again.",
			// 		};
			// 	}
			// 	return {
			// 		success: false,
			// 		error: `Redmine API error: ${response.status} ${response.statusText}`,
			// 	};
			// }

			// API key is valid, save it to database
			await db
				.update(user)
				.set({ redmineApiKey: data, updatedAt: new Date() })
				.where(eq(user.id, userId));

			return { success: true };
		} catch (error) {
			console.error("Error validating API key:", error);
			return {
				success: false,
				error:
					"Failed to connect to Redmine. Please check your network connection.",
			};
		}
	});

/**
 * Get current user information using stored API key
 */
export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<{ login?: string; error?: string }> => {
		const session = await getSession();
		if (!session?.user) {
			return { error: "Not authenticated" };
		}

		const baseUrl = process.env.REDMINE_BASE_URL;
		const apiKey = session.user.redmineApiKey;

		if (!baseUrl || !apiKey) {
			return { error: "API key not configured" };
		}

		try {
			const response = await fetch(`${baseUrl}/users/current.json`, {
				method: "GET",
				headers: {
					"X-Redmine-API-Key": apiKey,
					Accept: "application/json",
				},
			});

			if (!response.ok) {
				return { error: "Failed to fetch user info" };
			}

			const data = await response.json();
			return { login: data.user?.login };
		} catch (error) {
			console.error("Error fetching current user:", error);
			return { error: "Network error" };
		}
	},
);

/**
 * Clear API key from database (logout from Redmine)
 */
export const clearApiKeyFn = createServerFn({ method: "POST" }).handler(
	async (): Promise<{ success: boolean }> => {
		const session = await getSession();
		const userId = session?.user?.id;

		if (!userId) {
			return { success: false };
		}

		await db
			.update(user)
			.set({ redmineApiKey: null, updatedAt: new Date() })
			.where(eq(user.id, userId));

		return { success: true };
	},
);
