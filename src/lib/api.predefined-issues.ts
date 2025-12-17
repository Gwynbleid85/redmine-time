/**
 * Predefined Issues API - Server Functions
 * Provides server-side access to predefined issues configuration
 */

import { createServerFn } from "@tanstack/react-start";
import type { PredefinedIssue } from "@/lib/predefined-issues";

/**
 * Parse predefined issues from environment variable
 * Expected format: PREDEFINED_ISSUES='[{"id":129076,"subject":"Internal activities"},{"id":185333,"subject":"Organizační meetingy"}]'
 */
function parseEnvPredefinedIssues():
	| Omit<PredefinedIssue, "isPredefined">[]
	| null {
	try {
		// Try to get from process.env (server environment variables)
		const envValue = process.env.PREDEFINED_ISSUES;

		if (!envValue) {
			return null;
		}

		const parsed = JSON.parse(envValue);

		if (!Array.isArray(parsed)) {
			console.warn("PREDEFINED_ISSUES env var is not a valid JSON array");
			return null;
		}

		// Validate structure
		const valid = parsed.every(
			(item) =>
				typeof item === "object" &&
				typeof item.id === "number" &&
				typeof item.subject === "string",
		);

		if (!valid) {
			console.warn(
				'PREDEFINED_ISSUES env var contains invalid items. Expected format: [{"id":number,"subject":"string"}]',
			);
			return null;
		}

		return parsed;
	} catch (error) {
		console.error("Error parsing PREDEFINED_ISSUES env var:", error);
		return null;
	}
}

/**
 * Server function to get all predefined issues
 * Returns issues from env var if available, otherwise returns empty array
 */
export const getPredefinedIssues = createServerFn({ method: "GET" }).handler(
	async (): Promise<PredefinedIssue[]> => {
		try {
			const envIssues = parseEnvPredefinedIssues();
			const sourceIssues = envIssues || [];

			return sourceIssues.map((issue) => ({
				...issue,
				isPredefined: true,
			}));
		} catch (error) {
			console.error("Error fetching predefined issues:", error);
			// Return empty array on error to allow app to continue
			return [];
		}
	},
);
