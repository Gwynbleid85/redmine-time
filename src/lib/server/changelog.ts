import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

/**
 * Changelog Server Functions
 * Handles tracking which version the user has last seen
 */

/**
 * Helper to get current session
 */
async function getSession() {
	const headers = getRequestHeaders();
	return auth.api.getSession({ headers });
}

/**
 * Get the user's last seen version
 */
export const getChangelogStatusFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<{ lastSeenVersion: string | null }> => {
		const session = await getSession();
		const userId = session?.user?.id;

		if (!userId) {
			return { lastSeenVersion: null };
		}

		const result = await db
			.select({ lastSeenVersion: user.lastSeenVersion })
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		if (result.length === 0) {
			return { lastSeenVersion: null };
		}

		return { lastSeenVersion: result[0].lastSeenVersion };
	},
);

/**
 * Mark a version as seen by the current user
 */
export const markChangelogSeenFn = createServerFn({ method: "POST" })
	.inputValidator((data: { version: string }) => data)
	.handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
		const session = await getSession();
		const userId = session?.user?.id;

		if (!userId) {
			return { success: false, error: "You must be logged in" };
		}

		await db
			.update(user)
			.set({ lastSeenVersion: data.version })
			.where(eq(user.id, userId));

		return { success: true };
	});
