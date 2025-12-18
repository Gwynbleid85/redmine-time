/**
 * Redmine API Server Functions
 * These functions run on the server and proxy requests to Redmine API
 * to circumvent CORS restrictions
 */

import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import type {
	CreateTimeEntryResponse,
	RedmineIssueDetail,
	RedmineIssuesResponse,
	RedmineTimeEntriesResponse,
} from "@/lib/redmine-types";
import { redmineTimeEntriesToTasks } from "@/lib/redmine-utils";
import type { Task } from "@/lib/types";
import { getApiKeyServerFn } from "./server/api-key";

/**
 * Helper to validate Redmine configuration and API key
 * Throws specific errors for missing baseUrl vs missing apiKey
 */
function validateRedmineConfig(
	baseUrl: string | undefined,
	apiKey: string | null,
): asserts apiKey is string {
	if (!baseUrl) {
		throw new Error(
			"Redmine base URL is not configured. Please contact administrator.",
		);
	}
	if (!apiKey) {
		throw new Error(
			"Redmine API key is not configured. Please set your API key in settings.",
		);
	}
}

// Validation schemas
const GetTimeEntriesSchema = z.object({
	userId: z.string().optional(),
	projectId: z.string().optional(),
	from: z.string().optional(), // YYYY-MM-DD
	to: z.string().optional(), // YYYY-MM-DD
	limit: z.number().optional().default(100),
	offset: z.number().optional().default(0),
});

const CreateTimeEntrySchema = z.object({
	issueId: z.number(),
	hours: z.number().positive(),
	comments: z.string(),
	spentOn: z.string(), // YYYY-MM-DD
	activityId: z.number(),
});

const UpdateTimeEntrySchema = z.object({
	id: z.number(),
	issueId: z.number().optional(),
	hours: z.number().positive().optional(),
	comments: z.string().optional(),
	spentOn: z.string().optional(), // YYYY-MM-DD
	activityId: z.number().optional(),
});

const DeleteTimeEntrySchema = z.object({
	id: z.number(),
});

const DuplicateTimeEntrySchema = z.object({
	id: z.number(),
});

const GetIssuesByIdsSchema = z.object({
	issueIds: z.array(z.number()),
});

const GetIssuesSchema = z.object({
	projectId: z.string().optional(),
	limit: z.number().optional().default(100),
	offset: z.number().optional().default(0),
});

/**
 * Get time entries from Redmine
 * Server function that proxies requests to Redmine API
 */
export const getTimeEntries = createServerFn({ method: "GET" })
	.inputValidator(zodValidator(GetTimeEntriesSchema))
	.handler(async ({ data }): Promise<Task[]> => {
		const baseUrl = process.env.REDMINE_BASE_URL;
		const apiKey = await getApiKeyServerFn();
		validateRedmineConfig(baseUrl, apiKey);

		// Build query parameters
		const params = new URLSearchParams();
		if (data.userId) params.append("user_id", data.userId);
		if (data.projectId) params.append("project_id", data.projectId);
		if (data.from) params.append("from", data.from);
		if (data.to) params.append("to", data.to);
		params.append("limit", data.limit.toString());
		params.append("offset", data.offset.toString());

		const url = `${baseUrl}/time_entries.json?${params.toString()}`;

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"X-Redmine-API-Key": apiKey,
					Accept: "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(
					`Redmine API error: ${response.status} ${response.statusText}`,
				);
			}

			const json = (await response.json()) as RedmineTimeEntriesResponse;

			// console.log(
			// 	"[Redmine API] Sample entry:",
			// 	json.time_entries[0]
			// 		? {
			// 				id: json.time_entries[0].id,
			// 				spent_on: json.time_entries[0].spent_on,
			// 				hours: json.time_entries[0].hours,
			// 				comments: json.time_entries[0].comments,
			// 			}
			// 		: "No entries",
			// );

			// Transform Redmine time entries to Task objects
			const tasks = redmineTimeEntriesToTasks(json.time_entries);
			// console.log(
			// 	"[Redmine API] Transformed tasks:",
			// 	tasks.map((t) => ({
			// 		id: t.id,
			// 		date: t.date.toISOString(),
			// 		duration: t.duration,
			// 	})),
			// );
			return tasks;
		} catch (error) {
			console.error("Error fetching time entries from Redmine:", error);
			throw error;
		}
	});

/**
 * Create a new time entry in Redmine
 * Server function that proxies POST requests to Redmine API
 */
export const createTimeEntry = createServerFn({ method: "POST" })
	.inputValidator(zodValidator(CreateTimeEntrySchema))
	.handler(async ({ data }): Promise<Task> => {
		const baseUrl = process.env.REDMINE_BASE_URL;
		const apiKey = await getApiKeyServerFn();
		validateRedmineConfig(baseUrl, apiKey);

		const url = `${baseUrl}/time_entries.json`;

		const requestBody = {
			time_entry: {
				issue_id: data.issueId,
				hours: data.hours,
				comments: data.comments,
				spent_on: data.spentOn,
				activity_id: data.activityId,
			},
		};

		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"X-Redmine-API-Key": apiKey,
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`Redmine API error: ${response.status} ${response.statusText} - ${errorText}`,
				);
			}

			const json = (await response.json()) as CreateTimeEntryResponse;

			// Transform the created entry to Task format
			const tasks = redmineTimeEntriesToTasks([json.time_entry]);
			return tasks[0];
		} catch (error) {
			console.error("Error creating time entry in Redmine:", error);
			throw error;
		}
	});

/**
 * Update an existing time entry in Redmine
 * Server function that proxies PUT requests to Redmine API
 */
export const updateTimeEntry = createServerFn({ method: "POST" })
	.inputValidator(zodValidator(UpdateTimeEntrySchema))
	.handler(async ({ data }): Promise<void> => {
		const baseUrl = process.env.REDMINE_BASE_URL;
		const apiKey = await getApiKeyServerFn();
		validateRedmineConfig(baseUrl, apiKey);

		const url = `${baseUrl}/time_entries/${data.id}.json`;

		const requestBody = {
			time_entry: {
				...(data.issueId && { issue_id: data.issueId }),
				...(data.hours && { hours: data.hours }),
				...(data.comments !== undefined && { comments: data.comments }),
				...(data.spentOn && { spent_on: data.spentOn }),
				...(data.activityId && { activity_id: data.activityId }),
			},
		};

		try {
			const response = await fetch(url, {
				method: "PUT",
				headers: {
					"X-Redmine-API-Key": apiKey,
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`Redmine API error: ${response.status} ${response.statusText} - ${errorText}`,
				);
			}

			// PUT returns 204 No Content on success
		} catch (error) {
			console.error("Error updating time entry in Redmine:", error);
			throw error;
		}
	});

/**
 * Delete a time entry in Redmine
 * Server function that proxies DELETE requests to Redmine API
 */
export const deleteTimeEntry = createServerFn({ method: "POST" })
	.inputValidator(zodValidator(DeleteTimeEntrySchema))
	.handler(async ({ data }): Promise<void> => {
		const baseUrl = process.env.REDMINE_BASE_URL;
		const apiKey = await getApiKeyServerFn();
		validateRedmineConfig(baseUrl, apiKey);

		const url = `${baseUrl}/time_entries/${data.id}.json`;

		try {
			const response = await fetch(url, {
				method: "DELETE",
				headers: {
					"X-Redmine-API-Key": apiKey,
					Accept: "application/json",
				},
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`Redmine API error: ${response.status} ${response.statusText} - ${errorText}`,
				);
			}

			// DELETE returns 204 No Content on success
		} catch (error) {
			console.error("Error deleting time entry in Redmine:", error);
			throw error;
		}
	});

/**
 * Duplicate a time entry in Redmine
 * Fetches the entry and creates a new one with the same data
 */
export const duplicateTimeEntry = createServerFn({ method: "POST" })
	.inputValidator(zodValidator(DuplicateTimeEntrySchema))
	.handler(async ({ data }): Promise<Task> => {
		const baseUrl = process.env.REDMINE_BASE_URL;
		const apiKey = await getApiKeyServerFn();
		validateRedmineConfig(baseUrl, apiKey);

		console.log("duplicate time entry - start");

		// First, fetch the original entry
		const getUrl = `${baseUrl}/time_entries/${data.id}.json`;

		try {
			const getResponse = await fetch(getUrl, {
				method: "GET",
				headers: {
					"X-Redmine-API-Key": apiKey,
					Accept: "application/json",
				},
			});
			console.log("duplicate time entry");
			if (!getResponse.ok) {
				const errorText = await getResponse.text();
				throw new Error(
					`Redmine API error: ${getResponse.status} ${getResponse.statusText} - ${errorText}`,
				);
			}

			const originalEntry =
				(await getResponse.json()) as CreateTimeEntryResponse;
			const entry = originalEntry.time_entry;

			console.log(
				"[Redmine API] Duplicating time entry:",
				entry.id,
				"Issue:",
				entry.issue?.id,
				"Project:",
				entry.project.id,
			);

			// Create a duplicate entry
			// Redmine requires EITHER issue_id OR project_id (one is required)
			const createUrl = `${baseUrl}/time_entries.json`;
			const requestBody = {
				time_entry: {
					...(entry.issue
						? { issue_id: entry.issue.id }
						: { project_id: entry.project.id }),
					hours: entry.hours,
					comments: entry.comments,
					spent_on: entry.spent_on,
					activity_id: entry.activity.id,
				},
			};

			const createResponse = await fetch(createUrl, {
				method: "POST",
				headers: {
					"X-Redmine-API-Key": apiKey,
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify(requestBody),
			});
			console.log("create time entry");

			if (!createResponse.ok) {
				const errorText = await createResponse.text();
				throw new Error(
					`Redmine API error: ${createResponse.status} ${createResponse.statusText} - ${errorText}`,
				);
			}

			const json = (await createResponse.json()) as CreateTimeEntryResponse;

			// Transform the created entry to Task format
			const tasks = redmineTimeEntriesToTasks([json.time_entry]);
			return tasks[0];
		} catch (error) {
			console.error("Error duplicating time entry in Redmine:", error);
			throw error;
		}
	});

/**
 * Get issues by IDs from Redmine
 * Server function that batch fetches issue details
 */
export const getIssuesByIds = createServerFn({ method: "POST" })
	.inputValidator(zodValidator(GetIssuesByIdsSchema))
	.handler(async ({ data }): Promise<Map<number, RedmineIssueDetail>> => {
		const baseUrl = process.env.REDMINE_BASE_URL;
		const apiKey = await getApiKeyServerFn();
		validateRedmineConfig(baseUrl, apiKey);

		// Return empty map if no issue IDs provided
		if (data.issueIds.length === 0) {
			return new Map();
		}

		// Redmine API supports filtering by issue_id with comma-separated values
		const issueIdsParam = data.issueIds.join(",");
		const url = `${baseUrl}/issues.json?issue_id=${issueIdsParam}&limit=100`;

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"X-Redmine-API-Key": apiKey,
					Accept: "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(
					`Redmine API error: ${response.status} ${response.statusText}`,
				);
			}

			const json = (await response.json()) as RedmineIssuesResponse;

			// Convert array to Map for O(1) lookups
			const issueMap = new Map<number, RedmineIssueDetail>();
			for (const issue of json.issues) {
				issueMap.set(issue.id, issue);
			}

			return issueMap;
		} catch (error) {
			console.error("Error fetching issues from Redmine:", error);
			throw error;
		}
	});

/**
 * Get issues from Redmine
 * Server function that fetches issues for the project
 */
export const getIssues = createServerFn({ method: "GET" })
	.inputValidator(zodValidator(GetIssuesSchema))
	.handler(async ({ data }): Promise<RedmineIssueDetail[]> => {
		const baseUrl = process.env.REDMINE_BASE_URL;
		const apiKey = await getApiKeyServerFn();
		const projectId = process.env.REDMINE_PROJECT_ID || "allriskcore";
		validateRedmineConfig(baseUrl, apiKey);

		// Build query parameters
		const params = new URLSearchParams();
		if (data.projectId || projectId) {
			params.append("project_id", data.projectId || projectId || "");
		}
		params.append("limit", data.limit.toString());
		params.append("offset", data.offset.toString());

		const url = `${baseUrl}/issues.json?${params.toString()}`;

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"X-Redmine-API-Key": apiKey,
					Accept: "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(
					`Redmine API error: ${response.status} ${response.statusText}`,
				);
			}

			const json = (await response.json()) as RedmineIssuesResponse;

			return json.issues;
		} catch (error) {
			console.error("Error fetching issues from Redmine:", error);
			throw error;
		}
	});
