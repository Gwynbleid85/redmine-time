/**
 * Redmine REST API Type Definitions
 * Based on Redmine REST API v2
 * @see https://www.redmine.org/projects/redmine/wiki/Rest_TimeEntries
 */

export interface RedmineProject {
	id: number;
	name: string;
}

export interface RedmineIssue {
	id: number;
}

export interface RedmineTracker {
	id: number;
	name: string;
}

export interface RedmineStatus {
	id: number;
	name: string;
}

export interface RedminePriority {
	id: number;
	name: string;
}

export interface RedmineIssueDetail {
	id: number;
	subject: string;
	tracker: RedmineTracker;
	status: RedmineStatus;
	priority: RedminePriority;
	project: RedmineProject;
	description?: string;
}

/**
 * Extended issue type that includes custom and predefined issues
 * - Custom issues are stored in localStorage
 * - Predefined issues are hardcoded or configured via environment variables
 * - All are merged with API issues
 */
export interface ExtendedIssue {
	id: number;
	subject: string;
	isCustom?: boolean;
	isPredefined?: boolean;
	tracker?: RedmineTracker;
	status?: RedmineStatus;
	priority?: RedminePriority;
	project?: RedmineProject;
	description?: string;
}

export interface RedmineIssuesResponse {
	issues: RedmineIssueDetail[];
	total_count: number;
	offset: number;
	limit: number;
}

export interface RedmineUser {
	id: number;
	name: string;
}

export interface RedmineActivity {
	id: number;
	name: string;
}

export interface RedmineTimeEntry {
	id: number;
	project: RedmineProject;
	issue?: RedmineIssue;
	user: RedmineUser;
	activity: RedmineActivity;
	hours: number;
	comments: string;
	spent_on: string; // YYYY-MM-DD format
	created_on: string; // ISO datetime
	updated_on: string; // ISO datetime
}

export interface RedmineTimeEntriesResponse {
	time_entries: RedmineTimeEntry[];
	total_count: number;
	offset: number;
	limit: number;
}

export interface GetTimeEntriesParams {
	userId?: string;
	projectId?: string;
	from?: string; // YYYY-MM-DD
	to?: string; // YYYY-MM-DD
	limit?: number;
	offset?: number;
}

export interface CreateTimeEntryParams {
	issueId: number;
	hours: number;
	comments: string;
	spentOn: string; // YYYY-MM-DD
	activityId: number;
}

export interface CreateTimeEntryRequest {
	time_entry: {
		issue_id: number;
		hours: number;
		comments: string;
		spent_on: string;
		activity_id: number;
	};
}

export interface CreateTimeEntryResponse {
	time_entry: RedmineTimeEntry;
}

export interface UpdateTimeEntryParams {
	id: number;
	issueId?: number;
	hours?: number;
	comments?: string;
	spentOn?: string; // YYYY-MM-DD
	activityId?: number;
}

export interface UpdateTimeEntryRequest {
	time_entry: {
		issue_id?: number;
		hours?: number;
		comments?: string;
		spent_on?: string;
		activity_id?: number;
	};
}

/**
 * Common Redmine Activity IDs
 * These may vary by Redmine instance
 */
export const RedmineActivities = {
	DEVELOPMENT: 9,
	REGULAR: 20,
} as const;
