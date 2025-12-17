import {
	CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Plus,
	PlusCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDuration } from "@/lib/utils";

interface DailyHeaderProps {
	currentDate: Date;
	totalHours: number;
	redmineHours: number;
	placeholderHours: number;
	onPreviousDay: () => void;
	onNextDay: () => void;
	onToday: () => void;
	onAddTask: () => void;
	onAddPlaceholder: () => void;
	onDateSelect: (date: Date) => void;
}

export function DailyHeader({
	currentDate,
	totalHours,
	redmineHours,
	placeholderHours,
	onPreviousDay,
	onNextDay,
	onToday,
	onAddTask,
	onAddPlaceholder,
	onDateSelect,
}: DailyHeaderProps) {
	const [calendarOpen, setCalendarOpen] = useState(false);

	const formattedDate = currentDate.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	const isToday = (() => {
		const today = new Date();
		return (
			currentDate.getDate() === today.getDate() &&
			currentDate.getMonth() === today.getMonth() &&
			currentDate.getFullYear() === today.getFullYear()
		);
	})();

	const handleDateSelect = (date: Date | undefined) => {
		if (date) {
			onDateSelect(date);
			setCalendarOpen(false);
		}
	};

	return (
		<div className="mb-6 space-y-4">
			{/* Date and Navigation */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="icon"
						onClick={onPreviousDay}
						className="h-9 w-9"
						title="Previous day"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>

					<Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="ghost"
								className="h-auto gap-2 px-2 py-1 text-xl font-semibold tracking-tight hover:bg-accent sm:text-2xl"
								title="Select date"
							>
								{formattedDate}
								<CalendarIcon className="h-4 w-4 text-muted-foreground" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={currentDate}
								onSelect={handleDateSelect}
								defaultMonth={currentDate}
							/>
						</PopoverContent>
					</Popover>

					<Button
						variant="outline"
						size="icon"
						onClick={onNextDay}
						className="h-9 w-9"
						title="Next day"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={onToday}
						disabled={isToday}
						className="h-9 px-4"
					>
						Today
					</Button>
				</div>
			</div>

			{/* Total Hours and Add Buttons */}
			<div className="flex items-center justify-between rounded-lg border bg-card p-4">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="text-sm cursor-help">
								<span className="text-muted-foreground">Total:</span>{" "}
								<span className="text-lg font-semibold">
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
				<div className="flex items-center gap-2">
					<Button onClick={onAddTask} size="sm" className="gap-2">
						<Plus className="h-4 w-4" />
						Add Task
					</Button>
					<Button
						onClick={onAddPlaceholder}
						size="sm"
						variant="outline"
						className="gap-2"
					>
						<PlusCircle className="h-4 w-4" />
						Add Placeholder
					</Button>
				</div>
			</div>
		</div>
	);
}
