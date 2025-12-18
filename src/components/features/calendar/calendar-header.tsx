import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDuration } from "@/lib/utils";

interface CalendarHeaderProps {
	currentDate: Date;
	totalHours: number;
	redmineHours: number;
	placeholderHours: number;
	onPreviousWeek: () => void;
	onNextWeek: () => void;
	onToday: () => void;
	onAddTask: () => void;
}

export function CalendarHeader({
	currentDate,
	totalHours,
	redmineHours,
	placeholderHours,
	onPreviousWeek,
	onNextWeek,
	onToday,
	onAddTask,
}: CalendarHeaderProps) {
	const monthYear = currentDate.toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	});

	return (
		<div className="mb-6">
			{/* Navigation and Actions */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
						{monthYear}
					</h1>
					<div className="flex items-center gap-1">
						<Button
							variant="outline"
							size="icon"
							onClick={onPreviousWeek}
							className="h-8 w-8 bg-transparent"
							title="Previous month"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={onToday}
							className="h-8 px-3 bg-transparent"
						>
							Today
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={onNextWeek}
							className="h-8 w-8 bg-transparent"
							title="Next month"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="text-sm text-muted-foreground cursor-help">
									Total:{" "}
									<span className="font-semibold text-foreground">
										{formatDuration(totalHours)}
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<div className="text-sm space-y-1">
									<div>
										<span className="font-semibold">Total:</span>{" "}
										{formatDuration(totalHours)}
									</div>
									<div>
										<span className="font-semibold">Redmine:</span>{" "}
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
					<Button onClick={onAddTask} size="sm" className="gap-2">
						<Plus className="h-4 w-4" />
						Add Task
					</Button>
				</div>
			</div>
		</div>
	);
}
