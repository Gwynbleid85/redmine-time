import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Task } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

interface CalendarSummaryProps {
	tasks: Task[];
	totalHours: number;
	redmineHours: number;
	placeholderHours: number;
}

/**
 * Summary card showing total time entries and hours for the month
 */
export function CalendarSummary({
	tasks,
	totalHours,
	redmineHours,
	placeholderHours,
}: CalendarSummaryProps) {
	return (
		<div className="mb-4 p-4 bg-muted rounded-lg">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-muted-foreground">
						Total time entries this month
					</p>
					<p className="text-2xl font-bold">{tasks.length}</p>
				</div>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="cursor-help">
								<p className="text-sm text-muted-foreground">Total</p>
								<p className="text-2xl font-bold">
									{formatDuration(totalHours)}
								</p>
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<div className="text-sm space-y-1">
								<div>
									<span className="font-semibold">Total:</span>{" "}
									{formatDuration(totalHours)}
								</div>
								<div>
									<span className="font-semibold">Redmine entries:</span>{" "}
									{formatDuration(redmineHours)}
								</div>
								<div>
									<span className="font-semibold">Placeholders:</span>{" "}
									{formatDuration(placeholderHours)}
								</div>
							</div>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	);
}
