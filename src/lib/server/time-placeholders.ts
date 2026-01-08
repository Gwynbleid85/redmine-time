import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { and, eq, gte, lte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { timePlaceholder } from "@/lib/db/schema";
import type { PlaceholderType } from "@/lib/types";

/**
 * Time Placeholders Server Functions
 * Handles CRUD operations for user-specific time placeholders
 */

export interface TimePlaceholderData {
	id: string;
	type: PlaceholderType;
	date: string; // ISO string
	duration: number;
	note?: string;
}

/**
 * Helper to get current session
 */
async function getSession() {
	const headers = getRequestHeaders();
	return auth.api.getSession({ headers });
}

/**
 * Get all time placeholders for the current user within a date range
 */
export const getPlaceholdersFn = createServerFn({ method: "GET" })
	.inputValidator((data: { from: string; to: string }) => data)
	.handler(async ({ data }): Promise<TimePlaceholderData[]> => {
		const session = await getSession();
		const userId = session?.user?.id;

		if (!userId) {
			return [];
		}

		const fromDate = new Date(data.from);
		const toDate = new Date(data.to);

		const placeholders = await db
			.select({
				id: timePlaceholder.id,
				type: timePlaceholder.type,
				date: timePlaceholder.date,
				duration: timePlaceholder.duration,
				note: timePlaceholder.note,
			})
			.from(timePlaceholder)
			.where(
				and(
					eq(timePlaceholder.userId, userId),
					gte(timePlaceholder.date, fromDate),
					lte(timePlaceholder.date, toDate),
				),
			)
			.orderBy(timePlaceholder.date);

		return placeholders.map((p) => ({
			id: p.id,
			type: p.type as PlaceholderType,
			date: p.date.toISOString(),
			duration: p.duration,
			note: p.note ?? undefined,
		}));
	});

/**
 * Add a new time placeholder for the current user
 */
export const addPlaceholderFn = createServerFn({ method: "POST" })
	.inputValidator(
		(data: {
			type: PlaceholderType;
			date: string;
			duration: number;
			note?: string;
		}) => data,
	)
	.handler(
		async ({
			data,
		}): Promise<{
			success: boolean;
			error?: string;
			placeholder?: TimePlaceholderData;
		}> => {
			const session = await getSession();
			const userId = session?.user?.id;

			if (!userId) {
				return { success: false, error: "You must be logged in" };
			}

			// Validate placeholder type
			const validTypes: PlaceholderType[] = [
				"Doctor",
				"Vacation",
				"Holiday",
				"Sickday",
			];
			if (!validTypes.includes(data.type)) {
				return { success: false, error: "Invalid placeholder type" };
			}

			// Validate duration
			if (data.duration <= 0 || data.duration > 24) {
				return {
					success: false,
					error: "Duration must be between 0 and 24 hours",
				};
			}

			// Generate a unique ID
			const id = crypto.randomUUID();
			const date = new Date(data.date);

			await db.insert(timePlaceholder).values({
				id,
				userId,
				type: data.type,
				date,
				duration: data.duration,
				note: data.note,
			});

			return {
				success: true,
				placeholder: {
					id,
					type: data.type,
					date: date.toISOString(),
					duration: data.duration,
					note: data.note,
				},
			};
		},
	);

/**
 * Update an existing time placeholder for the current user
 */
export const updatePlaceholderFn = createServerFn({ method: "POST" })
	.inputValidator(
		(data: {
			id: string;
			type?: PlaceholderType;
			date?: string;
			duration?: number;
			note?: string;
		}) => data,
	)
	.handler(
		async ({
			data,
		}): Promise<{
			success: boolean;
			error?: string;
			placeholder?: TimePlaceholderData;
		}> => {
			const session = await getSession();
			const userId = session?.user?.id;

			if (!userId) {
				return { success: false, error: "You must be logged in" };
			}

			// Validate type if provided
			if (data.type) {
				const validTypes: PlaceholderType[] = [
					"Doctor",
					"Vacation",
					"Holiday",
					"Sickday",
				];
				if (!validTypes.includes(data.type)) {
					return { success: false, error: "Invalid placeholder type" };
				}
			}

			// Validate duration if provided
			if (data.duration !== undefined) {
				if (data.duration <= 0 || data.duration > 24) {
					return {
						success: false,
						error: "Duration must be between 0 and 24 hours",
					};
				}
			}

			// Build update object
			const updates: {
				type?: string;
				date?: Date;
				duration?: number;
				note?: string;
				updatedAt: Date;
			} = {
				updatedAt: new Date(),
			};

			if (data.type !== undefined) updates.type = data.type;
			if (data.date !== undefined) updates.date = new Date(data.date);
			if (data.duration !== undefined) updates.duration = data.duration;
			if (data.note !== undefined) updates.note = data.note;

			const result = await db
				.update(timePlaceholder)
				.set(updates)
				.where(
					and(
						eq(timePlaceholder.id, data.id),
						eq(timePlaceholder.userId, userId),
					),
				)
				.returning({
					id: timePlaceholder.id,
					type: timePlaceholder.type,
					date: timePlaceholder.date,
					duration: timePlaceholder.duration,
					note: timePlaceholder.note,
				});

			// Check if any row was updated
			if (result.length === 0) {
				return { success: false, error: "Time placeholder not found" };
			}

			const updated = result[0];
			return {
				success: true,
				placeholder: {
					id: updated.id,
					type: updated.type as PlaceholderType,
					date: updated.date.toISOString(),
					duration: updated.duration,
					note: updated.note ?? undefined,
				},
			};
		},
	);

/**
 * Delete a time placeholder for the current user
 */
export const deletePlaceholderFn = createServerFn({ method: "POST" })
	.inputValidator((data: { id: string }) => data)
	.handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
		const session = await getSession();
		const userId = session?.user?.id;

		if (!userId) {
			return { success: false, error: "You must be logged in" };
		}

		const result = await db
			.delete(timePlaceholder)
			.where(
				and(
					eq(timePlaceholder.id, data.id),
					eq(timePlaceholder.userId, userId),
				),
			);

		// Check if any row was deleted
		if (result.rowCount === 0) {
			return { success: false, error: "Time placeholder not found" };
		}

		return { success: true };
	});
