import {
	getDayName,
	getEntriesForDay,
	getMonthDays,
	getTotalHoursForEntries,
	isInCurrentMonth,
} from "@/lib/calendar-utils";
import type { CalendarEntry, Task, TimePlaceholder } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CalendarDay } from "./calendar-day";

interface CalendarGridProps {
	currentDate: Date;
	entries: CalendarEntry[];
	onTaskClick: (task: Task) => void;
	onTaskEdit: (task: Task) => void;
	onTaskDuplicate: (task: Task) => void;
	onTaskDelete: (taskId: string) => void;
	onPlaceholderClick: (placeholder: TimePlaceholder) => void;
	onPlaceholderEdit: (placeholder: TimePlaceholder) => void;
	onPlaceholderDelete: (placeholderId: string) => void;
	onDateClick?: (date: Date) => void;
}

export function CalendarGrid({
	currentDate,
	entries,
	onTaskClick,
	onTaskEdit,
	onTaskDuplicate,
	onTaskDelete,
	onPlaceholderClick,
	onPlaceholderEdit,
	onPlaceholderDelete,
	onDateClick,
}: CalendarGridProps) {
	const monthDays = getMonthDays(currentDate);

	const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

	return (
		<div className="space-y-2">
			{/* Day names header - hidden on mobile */}
			<div
				className="hidden md:grid gap-2 mb-2"
				style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 0.2fr 0.2fr" }}
			>
				{dayNames.map((name, idx) => (
					<div
						key={name}
						className={cn(
							"text-center text-sm font-medium text-muted-foreground py-2",
							(idx === 5 || idx === 6) && "text-xs",
						)}
					>
						{name}
					</div>
				))}
			</div>

			{/* Calendar days - column on mobile, grid on desktop */}
			<div
				className="flex flex-col md:grid gap-2"
				style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 0.2fr 0.2fr" }}
			>
				{monthDays.map((day, index) => {
					const dayEntries = getEntriesForDay(entries, day);
					const totalHours = getTotalHoursForEntries(entries, day);
					const isHighWorkload = totalHours >= 6;
					const isCurrentMonth = isInCurrentMonth(day, currentDate);

					return (
						<CalendarDay
							key={index}
							date={day}
							dayName={getDayName(day)}
							entries={dayEntries}
							totalHours={totalHours}
							isHighWorkload={isHighWorkload}
							isCurrentMonth={isCurrentMonth}
							onTaskClick={onTaskClick}
							onTaskEdit={onTaskEdit}
							onTaskDuplicate={onTaskDuplicate}
							onTaskDelete={onTaskDelete}
							onPlaceholderClick={onPlaceholderClick}
							onPlaceholderEdit={onPlaceholderEdit}
							onPlaceholderDelete={onPlaceholderDelete}
							onDateClick={onDateClick}
						/>
					);
				})}
			</div>
		</div>
	);
}
