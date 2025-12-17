import { useNavigate } from "@tanstack/react-router";
import { Calendar, CalendarDays } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ViewSwitcherProps {
	currentView: "month" | "day";
	currentDate: Date;
}

export function ViewSwitcher({ currentView, currentDate }: ViewSwitcherProps) {
	const navigate = useNavigate();

	const handleViewChange = (view: string) => {
		if (view === "month") {
			// Navigate to calendar with the current month/year
			navigate({
				to: "/calendar",
				search: {
					year: currentDate.getFullYear(),
					month: currentDate.getMonth(),
				},
			});
		} else if (view === "day") {
			// Navigate to daily with the current date
			// If we're in month view, use today's date or the first day of the month
			const targetDate = currentView === "month" ? new Date() : currentDate;

			navigate({
				to: "/daily",
				search: {
					year: targetDate.getFullYear(),
					month: targetDate.getMonth(),
					day: targetDate.getDate(),
				},
			});
		}
	};

	return (
		<Tabs value={currentView} onValueChange={handleViewChange}>
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="month" className="gap-2">
					<Calendar className="h-4 w-4" />
					<span className="inline">Month</span>
				</TabsTrigger>
				<TabsTrigger value="day" className="gap-2">
					<CalendarDays className="h-4 w-4" />
					<span className="inline">Day</span>
				</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}
