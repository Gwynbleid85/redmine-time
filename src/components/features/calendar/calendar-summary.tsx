import type { Task } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

interface CalendarSummaryProps {
	tasks: Task[];
}

/**
 * Summary card showing total time entries and hours for the month
 */
export function CalendarSummary({ tasks }: CalendarSummaryProps) {
	const totalHours = tasks.reduce((sum, task) => sum + task.duration, 0);

	return (
		<div className="mb-4 p-4 bg-muted rounded-lg">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-muted-foreground">
						Total time entries this month
					</p>
					<p className="text-2xl font-bold">{tasks.length}</p>
				</div>
				<div>
					<p className="text-sm text-muted-foreground">Total</p>
					<p className="text-2xl font-bold">{formatDuration(totalHours)}</p>
				</div>
			</div>
		</div>
	);
}
