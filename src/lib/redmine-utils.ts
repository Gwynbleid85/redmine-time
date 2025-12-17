import type { RedmineTimeEntry } from "./redmine-types";
import type { Task, TaskType } from "./types";

/**
 * Map Redmine activity ID to TaskType
 */
export function mapActivityToTaskType(activityId: number): TaskType {
	// Map based on common activity IDs
	// Adjust these mappings based on your Redmine instance
	switch (activityId) {
		case 9: // Development
			return "Feature";
		case 20: // Regular
			return "Task";
		default:
			return "Task";
	}
}

/**
 * Transform Redmine time entry to Task object
 */
export function redmineToTask(entry: RedmineTimeEntry): Task {
	return {
		id: `redmine-${entry.id}`,
		title: entry.comments || "Time entry",
		description: `${entry.activity.name} - ${entry.project.name}`,
		date: new Date(entry.spent_on),
		duration: entry.hours,
		type: mapActivityToTaskType(entry.activity.id),
		taskId: entry.issue ? `#${entry.issue.id}` : undefined,
		completed: true, // Time entries are already logged, so marked as completed
		// Issue metadata will be enriched separately in calendar.tsx
		issueSubject: undefined,
		issueTracker: undefined,
		issueStatus: undefined,
		// Redmine metadata for editing
		activityId: entry.activity.id,
		issueId: entry.issue?.id,
	};
}

/**
 * Transform array of Redmine time entries to Task array
 */
export function redmineTimeEntriesToTasks(entries: RedmineTimeEntry[]): Task[] {
	return entries.map(redmineToTask);
}

/**
 * Get start and end date for a given month
 */
export function getMonthDateRange(date: Date): { from: string; to: string } {
	const year = date.getFullYear();
	const month = date.getMonth();

	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);

	return {
		from: formatDateForRedmine(firstDay),
		to: formatDateForRedmine(lastDay),
	};
}

/**
 * Get start and end date for all visible days in the calendar grid
 * This includes days from previous and next months
 */
export function getCalendarDateRange(date: Date): { from: string; to: string } {
	const year = date.getFullYear();
	const month = date.getMonth();

	// Get first day of the month
	const firstDay = new Date(year, month, 1);

	// Get last day of the month
	const lastDay = new Date(year, month + 1, 0);

	// Find the Monday before or on the first day
	const firstDayOfWeek = firstDay.getDay();
	const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
	const startDate = new Date(firstDay);
	startDate.setDate(firstDay.getDate() - daysToSubtract);

	// Find the Sunday after or on the last day
	const lastDayOfWeek = lastDay.getDay();
	const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
	const endDate = new Date(lastDay);
	endDate.setDate(lastDay.getDate() + daysToAdd);

	return {
		from: formatDateForRedmine(startDate),
		to: formatDateForRedmine(endDate),
	};
}

/**
 * Format date for Redmine API (YYYY-MM-DD)
 */
export function formatDateForRedmine(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * Get current month start and end dates
 */
export function getCurrentMonthRange(): { from: string; to: string } {
	return getMonthDateRange(new Date());
}

/**
 * Get previous month start and end dates
 */
export function getPreviousMonthRange(currentDate: Date): {
	from: string;
	to: string;
} {
	const prevMonth = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth() - 1,
		1,
	);
	return getMonthDateRange(prevMonth);
}

/**
 * Get next month start and end dates
 */
export function getNextMonthRange(currentDate: Date): {
	from: string;
	to: string;
} {
	const nextMonth = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth() + 1,
		1,
	);
	return getMonthDateRange(nextMonth);
}

/**
 * Extract numeric Redmine ID from prefixed task ID
 * @param taskId - Task ID string (e.g., "redmine-146536")
 * @returns Numeric ID or null if invalid
 */
export function extractRedmineId(taskId: string): number | null {
	const match = taskId.match(/^redmine-(\d+)$/);
	if (!match?.[1]) {
		return null;
	}
	const id = Number.parseInt(match[1], 10);
	return Number.isNaN(id) ? null : id;
}
