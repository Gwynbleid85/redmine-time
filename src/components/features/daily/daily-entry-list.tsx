import type { CalendarEntry, Task, TimePlaceholder } from "@/lib/types";
import { PlaceholderCard } from "../placeholders/placeholder-card";
import { DailyEntryCard } from "./daily-entry-card";

interface DailyEntryListProps {
	entries: CalendarEntry[];
	onTaskClick: (task: Task) => void;
	onTaskEdit: (task: Task) => void;
	onTaskDuplicate: (task: Task) => void;
	onTaskDelete: (taskId: string) => void;
	onPlaceholderEdit: (placeholder: TimePlaceholder) => void;
	onPlaceholderDelete: (placeholderId: string) => void;
}

function isPlaceholder(entry: CalendarEntry): entry is TimePlaceholder {
	return "isPlaceholder" in entry && entry.isPlaceholder === true;
}

export function DailyEntryList({
	entries,
	onTaskClick,
	onTaskEdit,
	onTaskDuplicate,
	onTaskDelete,
	onPlaceholderEdit,
	onPlaceholderDelete,
}: DailyEntryListProps) {
	if (entries.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<div className="rounded-full bg-muted p-6 mb-4">
					<svg
						aria-hidden="true"
						className="h-12 w-12 text-muted-foreground"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-semibold mb-2">No time entries</h3>
				<p className="text-sm text-muted-foreground max-w-sm">
					No time entries for this day. Click "Add Task" or "Add Placeholder" to
					create your first entry.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{entries.map((entry) =>
				isPlaceholder(entry) ? (
					<PlaceholderCard
						key={entry.id}
						placeholder={entry}
						onEdit={() => onPlaceholderEdit(entry)}
						onDelete={() => onPlaceholderDelete(entry.id)}
					/>
				) : (
					<DailyEntryCard
						key={entry.id}
						task={entry}
						onClick={() => onTaskClick(entry)}
						onEdit={() => onTaskEdit(entry)}
						onDuplicate={() => onTaskDuplicate(entry)}
						onDelete={() => onTaskDelete(entry.id)}
					/>
				),
			)}
		</div>
	);
}
