export type TaskType = "Epic" | "Task" | "Bug" | "Feature";

export type PlaceholderType = "Doctor" | "Vacation" | "Holiday" | "Sickday";

export interface Task {
	id: string;
	title: string;
	description: string;
	date: Date;
	duration: number; // in hours
	type: TaskType;
	taskId?: string; // e.g., "#186933"
	completed?: boolean;
	// Issue metadata (enriched from separate API call)
	issueSubject?: string; // Issue name/title
	issueTracker?: string; // e.g., "Bug", "Feature"
	issueStatus?: string; // e.g., "In Progress", "Resolved"
	// Redmine metadata for editing
	activityId?: number; // Redmine activity ID (9=Vývoj, 19=Provoz-nepravidelny, 20=Provoz-pravidelny)
	issueId?: number; // Numeric issue ID (extracted from taskId)
	// Discriminator field
	isPlaceholder?: false;
}

export interface TimePlaceholder {
	id: string;
	type: PlaceholderType;
	date: Date;
	duration: number; // hours
	note?: string;
	isPlaceholder: true; // discriminator field
}

// Union type for calendar items
export type CalendarEntry = Task | TimePlaceholder;

export interface CalendarDay {
	date: Date;
	tasks: Task[];
	totalHours: number;
}

// Default durations for placeholder types
export const PLACEHOLDER_DEFAULTS: Record<PlaceholderType, number> = {
	Doctor: 4,
	Vacation: 8,
	Holiday: 8,
	Sickday: 8,
};
