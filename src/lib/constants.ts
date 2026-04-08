/**
 * Application-wide constants
 */

/**
 * Redmine API Configuration
 */
export const REDMINE_API = {
	/**
	 * Default limit for fetching time entries from Redmine API
	 * Increased from 100 to 1000 to ensure complete data retrieval
	 */
	DEFAULT_TIME_ENTRIES_LIMIT: 1000,

	/**
	 * Default limit for fetching issues from Redmine API
	 */
	DEFAULT_ISSUES_LIMIT: 5000,

	/**
	 * Default offset for pagination
	 */
	DEFAULT_OFFSET: 0,
} as const;
