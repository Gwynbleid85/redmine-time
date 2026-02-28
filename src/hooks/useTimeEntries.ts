import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getIssuesByIds, getTimeEntries } from "@/lib/api.redmine";
import { getCalendarDateRange } from "@/lib/redmine-utils";
import type { CalendarEntry, Task } from "@/lib/types";
import { usePlaceholders } from "./usePlaceholders";

/**
 * Custom hook for fetching and enriching time entries
 * Handles fetching time entries, issue details, placeholders, and enrichment
 */
export function useTimeEntries(currentDate: Date) {
	// Calculate date range for all visible calendar days (including prev/next month days)
	const dateRange = getCalendarDateRange(currentDate);

	// Fetch time entries using TanStack Query
	const {
		data: rawTasks = [],
		isLoading: isLoadingTasks,
		error: tasksError,
	} = useQuery({
		queryKey: ["timeEntries", dateRange.from, dateRange.to],
		queryFn: () =>
			getTimeEntries({
				data: {
					userId: "me", // Filter for current user
					from: dateRange.from,
					to: dateRange.to,
					limit: 1000, // Fetch more entries to cover full month
				},
			}),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	useEffect(() => {
		if (isLoadingTasks === false && tasksError === null) {
			console.log(
				`Fetched ${rawTasks.length} time entries for date range ${dateRange.from} to ${dateRange.to}. Entries: `,
				rawTasks,
			);
		}
	}, [isLoadingTasks, dateRange.from, dateRange.to, rawTasks, tasksError]);

	// Fetch placeholders using the new hook
	const {
		data: placeholders = [],
		isLoading: isLoadingPlaceholders,
		error: placeholdersError,
	} = usePlaceholders(dateRange);

	// Extract unique issue IDs from time entries
	const issueIds = Array.from(
		new Set(
			rawTasks
				.map((task) => task.taskId)
				.filter((id): id is string => id !== undefined)
				.map((id) => Number.parseInt(id.replace("#", ""), 10))
				.filter((id) => !Number.isNaN(id)),
		),
	);

	// Fetch issue details for all referenced issues
	const { data: issuesMap } = useQuery({
		queryKey: ["issues", issueIds],
		queryFn: () =>
			getIssuesByIds({
				data: { issueIds },
			}),
		enabled: issueIds.length > 0,
		staleTime: 1000 * 60 * 10, // 10 minutes (issues change less frequently)
	});

	// Enrich tasks with issue metadata
	const tasks: Task[] = rawTasks.map((task) => {
		if (!task.taskId || !issuesMap) {
			return task;
		}

		const issueId = Number.parseInt(task.taskId.replace("#", ""), 10);
		if (Number.isNaN(issueId)) {
			return task;
		}

		const issue = issuesMap.get(issueId);
		if (!issue) {
			return task;
		}

		return {
			...task,
			issueSubject: issue.subject,
			issueTracker: issue.tracker.name,
			issueStatus: issue.status.name,
		};
	});

	// Merge tasks and placeholders, then sort by date
	const allEntries: CalendarEntry[] = [...tasks, ...placeholders].sort(
		(a, b) => a.date.getTime() - b.date.getTime(),
	);

	return {
		tasks,
		placeholders,
		entries: allEntries,
		isLoading: isLoadingTasks || isLoadingPlaceholders,
		error: tasksError || placeholdersError,
	};
}
