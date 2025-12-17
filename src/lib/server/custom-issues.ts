import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { customIssue } from "@/lib/db/schema";

/**
 * Custom Issues Server Functions
 * Handles CRUD operations for user-specific custom issues
 */

export interface CustomIssueData {
	id: string;
	issueId: number;
	subject: string;
}

/**
 * Helper to get current session
 */
async function getSession() {
	const headers = getRequestHeaders();
	return auth.api.getSession({ headers });
}

/**
 * Get all custom issues for the current user
 */
export const getCustomIssuesFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<CustomIssueData[]> => {
		const session = await getSession();
		const userId = session?.user?.id;

		if (!userId) {
			return [];
		}

		const issues = await db
			.select({
				id: customIssue.id,
				issueId: customIssue.issueId,
				subject: customIssue.subject,
			})
			.from(customIssue)
			.where(eq(customIssue.userId, userId))
			.orderBy(customIssue.issueId);

		return issues;
	},
);

/**
 * Add a new custom issue for the current user
 */
export const addCustomIssueFn = createServerFn({ method: "POST" })
	.inputValidator((data: { issueId: number; subject: string }) => data)
	.handler(
		async ({
			data,
		}): Promise<{
			success: boolean;
			error?: string;
			issue?: CustomIssueData;
		}> => {
			const session = await getSession();
			const userId = session?.user?.id;

			if (!userId) {
				return { success: false, error: "You must be logged in" };
			}

			// Check if issue ID already exists for this user
			const existing = await db
				.select({ id: customIssue.id })
				.from(customIssue)
				.where(
					and(
						eq(customIssue.userId, userId),
						eq(customIssue.issueId, data.issueId),
					),
				)
				.limit(1);

			if (existing.length > 0) {
				return {
					success: false,
					error: `Custom issue with ID ${data.issueId} already exists`,
				};
			}

			// Generate a unique ID
			const id = crypto.randomUUID();

			await db.insert(customIssue).values({
				id,
				userId,
				issueId: data.issueId,
				subject: data.subject,
			});

			return {
				success: true,
				issue: {
					id,
					issueId: data.issueId,
					subject: data.subject,
				},
			};
		},
	);

/**
 * Delete a custom issue for the current user
 */
export const deleteCustomIssueFn = createServerFn({ method: "POST" })
	.inputValidator((data: { id: string }) => data)
	.handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
		const session = await getSession();
		const userId = session?.user?.id;

		if (!userId) {
			return { success: false, error: "You must be logged in" };
		}

		const result = await db
			.delete(customIssue)
			.where(and(eq(customIssue.id, data.id), eq(customIssue.userId, userId)));

		// Check if any row was deleted
		if (result.rowCount === 0) {
			return { success: false, error: "Custom issue not found" };
		}

		return { success: true };
	});
