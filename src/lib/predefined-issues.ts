/**
 * Predefined Issues Management
 * Provides utilities for managing predefined/hardcoded issues that can be configured via environment variables
 * or fallback to hardcoded defaults.
 */

export interface PredefinedIssue {
	id: number;
	subject: string;
	isPredefined: true; // Flag to distinguish from API and custom issues
}

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
 * Get all predefined issues
 * Returns issues from env var if available, otherwise returns hardcoded defaults
 */
export function getPredefinedIssues(): PredefinedIssue[] {
	const envIssues = parseEnvPredefinedIssues();
	const sourceIssues = envIssues || [];

	return sourceIssues.map((issue) => ({
		...issue,
		isPredefined: true,
	}));
}

/**
 * Check if an issue ID is a predefined issue
 */
export function isPredefinedIssue(id: number): boolean {
	const issues = getPredefinedIssues();
	return issues.some((issue) => issue.id === id);
}

/**
 * Get a predefined issue by ID
 */
export function getPredefinedIssueById(
	id: number,
): PredefinedIssue | undefined {
	const issues = getPredefinedIssues();
	return issues.find((issue) => issue.id === id);
}
