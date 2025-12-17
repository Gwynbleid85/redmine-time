import { useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import type { CalendarEntry, Task, TimePlaceholder } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";
import { PlaceholderItem } from "../placeholders/placeholder-item";
import { TaskItem } from "../time-entries/task-item";

interface CalendarDayProps {
	date: Date;
	dayName: string;
	entries: CalendarEntry[];
	totalHours: number;
	isHighWorkload: boolean;
	isCurrentMonth: boolean;
	onTaskClick: (task: Task) => void;
	onTaskEdit: (task: Task) => void;
	onTaskDuplicate: (task: Task) => void;
	onTaskDelete: (taskId: string) => void;
	onPlaceholderEdit: (placeholder: TimePlaceholder) => void;
	onPlaceholderDelete: (placeholderId: string) => void;
	onDateClick?: (date: Date) => void;
}

function isPlaceholder(entry: CalendarEntry): entry is TimePlaceholder {
	return "isPlaceholder" in entry && entry.isPlaceholder === true;
}

export function CalendarDay({
	date,
	entries,
	totalHours,
	isCurrentMonth,
	onTaskClick,
	onTaskEdit,
	onTaskDuplicate,
	onTaskDelete,
	onPlaceholderEdit,
	onPlaceholderDelete,
	onDateClick,
}: CalendarDayProps) {
	const isToday = new Date().toDateString() === date.toDateString();
	const navigate = useNavigate();

	const handleDayHeaderClick = (e: React.MouseEvent) => {
		// Double-click navigates to daily view
		// Single click is handled by onDateClick if provided
		if (e.detail === 2) {
			// Double-click - navigate to daily view
			navigate({
				to: "/daily",
				search: {
					year: date.getFullYear(),
					month: date.getMonth(),
					day: date.getDate(),
				},
			});
		} else if (e.detail === 1) {
			// Single click - open add task dialog if handler is provided
			onDateClick?.(date);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			// Navigate to daily view on Enter/Space
			navigate({
				to: "/daily",
				search: {
					year: date.getFullYear(),
					month: date.getMonth(),
					day: date.getDate(),
				},
			});
		}
	};

	return (
		<Card
			className={cn(
				"flex flex-col overflow-hidden transition-colors",
				isToday && "ring-2 ring-primary",
				!isCurrentMonth && "opacity-40",
			)}
		>
			<button
				type="button"
				className={cn(
					"border-b bg-muted/30 px-2 py-2 sm:px-3 sm:py-2 transition-colors cursor-pointer hover:bg-muted/50 w-full text-left",
				)}
				onClick={handleDayHeaderClick}
				onKeyDown={handleKeyDown}
				title="Click to add task, double-click to view day details"
			>
				<div className="flex items-baseline justify-between">
					<div className="text-lg font-semibold sm:text-xl">
						{date.getDate()}
					</div>
					{totalHours > 0 && (
						<div
							className={cn(
								"text-xs font-semibold sm:text-sm",
								totalHours < 8 ? "text-destructive" : "text-foreground",
							)}
						>
							{formatDuration(totalHours)}
						</div>
					)}
				</div>
			</button>

			<div className="flex-1 p-2 space-y-1 min-h-[120px] max-h-[300px] overflow-y-auto">
				{entries.length === 0 ? (
					<div className="flex items-center justify-center h-full text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
						No entries
					</div>
				) : (
					entries.map((entry) =>
						isPlaceholder(entry) ? (
							<PlaceholderItem
								key={entry.id}
								placeholder={entry}
								onEdit={() => onPlaceholderEdit(entry)}
								onDelete={() => onPlaceholderDelete(entry.id)}
							/>
						) : (
							<TaskItem
								key={entry.id}
								task={entry}
								onClick={() => onTaskClick(entry)}
								onEdit={() => onTaskEdit(entry)}
								onDuplicate={() => {
									console.log("Duplicating task with id:", entry.id);
									onTaskDuplicate(entry);
								}}
								onDelete={() => onTaskDelete(entry.id)}
							/>
						),
					)
				)}
			</div>
		</Card>
	);
}
