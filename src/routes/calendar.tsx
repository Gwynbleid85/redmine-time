import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { CalendarError } from "@/components/features/calendar/calendar-error";
import { CalendarGrid } from "@/components/features/calendar/calendar-grid";
import { CalendarHeader } from "@/components/features/calendar/calendar-header";
import { CalendarLoading } from "@/components/features/calendar/calendar-loading";
import { CalendarSummary } from "@/components/features/calendar/calendar-summary";
import { PageHeader } from "@/components/features/layout/page-header";
import { PlaceholderDetailDialog } from "@/components/features/placeholders/placeholder-detail-dialog";
import { EntryDialog } from "@/components/features/time-entries/entry-dialog";
import { TaskDetailDialog } from "@/components/features/time-entries/task-detail-dialog";
import { useApiKeyManagement } from "@/hooks/useApiKeyManagement";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useTimeEntryMutations } from "@/hooks/useTimeEntryMutations";
import { requireAuth } from "@/lib/auth-utils";
import { isInCurrentMonth } from "@/lib/calendar-utils";
import {
	addPlaceholderFn,
	deletePlaceholderFn,
	updatePlaceholderFn,
} from "@/lib/server/time-placeholders";
import type { PlaceholderType, Task, TimePlaceholder } from "@/lib/types";

const calendarSearchSchema = z.object({
	year: z.coerce.number().int().min(1900).max(2100).optional(),
	month: z.coerce.number().int().min(0).max(11).optional(),
});

export const Route = createFileRoute("/calendar")({
	component: CalendarPage,
	beforeLoad: requireAuth,
	validateSearch: (search) => calendarSearchSchema.parse(search),
});

function CalendarPage() {
	// Dialog state for tasks
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);

	// Dialog state for placeholders
	const [selectedPlaceholder, setSelectedPlaceholder] =
		useState<TimePlaceholder | null>(null);
	const [isPlaceholderDetailDialogOpen, setIsPlaceholderDetailDialogOpen] =
		useState(false);

	// Unified entry dialog state
	const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
	const [entryDialogTab, setEntryDialogTab] = useState<
		"timeEntry" | "placeholder"
	>("timeEntry");
	const [entryToEdit, setEntryToEdit] = useState<Task | TimePlaceholder | null>(
		null,
	);

	const queryClient = useQueryClient();

	// Get month/year from URL search params
	const search = Route.useSearch();
	const navigate = useNavigate();

	// Derive currentDate from search params (default to current month)
	const now = new Date();
	const year = search.year ?? now.getFullYear();
	const month = search.month ?? now.getMonth();
	const currentDate = useMemo(() => new Date(year, month, 1), [year, month]);

	// Navigation handlers that update URL
	const handlePreviousMonth = () => {
		const prevMonth = month === 0 ? 11 : month - 1;
		const prevYear = month === 0 ? year - 1 : year;
		navigate({
			to: "/calendar",
			search: { year: prevYear, month: prevMonth },
		});
	};

	const handleNextMonth = () => {
		const nextMonth = month === 11 ? 0 : month + 1;
		const nextYear = month === 11 ? year + 1 : year;
		navigate({
			to: "/calendar",
			search: { year: nextYear, month: nextMonth },
		});
	};

	const handleToday = () => {
		const today = new Date();
		navigate({
			to: "/calendar",
			search: { year: today.getFullYear(), month: today.getMonth() },
		});
	};

	const { tasks, entries, isLoading, error } = useTimeEntries(currentDate);

	const { handleUpdate, handleCreateTimeEntry, handleDelete, handleDuplicate } =
		useTimeEntryMutations();

	const apiKeyManagement = useApiKeyManagement();

	// Filter tasks and entries to only include current month for summary
	const currentMonthTasks = useMemo(() => {
		return tasks.filter((task) => isInCurrentMonth(task.date, currentDate));
	}, [tasks, currentDate]);

	const currentMonthEntries = useMemo(() => {
		return entries.filter((entry) => isInCurrentMonth(entry.date, currentDate));
	}, [entries, currentDate]);

	// Calculate total hours and breakdown for the month
	const totalMonthHours = useMemo(() => {
		return currentMonthEntries.reduce((sum, entry) => sum + entry.duration, 0);
	}, [currentMonthEntries]);

	const redmineMonthHours = useMemo(() => {
		return currentMonthEntries
			.filter((entry) => !("isPlaceholder" in entry && entry.isPlaceholder))
			.reduce((sum, entry) => sum + entry.duration, 0);
	}, [currentMonthEntries]);

	const placeholderMonthHours = useMemo(() => {
		return currentMonthEntries
			.filter((entry) => "isPlaceholder" in entry && entry.isPlaceholder)
			.reduce((sum, entry) => sum + entry.duration, 0);
	}, [currentMonthEntries]);

	// Task interaction handlers
	const handleTaskClick = (task: Task) => {
		setSelectedTask(task);
		setIsDetailDialogOpen(true);
	};

	const handleTaskEdit = (task: Task) => {
		setEntryToEdit(task);
		setIsEntryDialogOpen(true);
	};

	const handleDateClick = (date: Date) => {
		setSelectedDate(date);
		setEntryToEdit(null);
		setIsEntryDialogOpen(true);
	};

	const handleSaveTask = (data: {
		issueId: number;
		hours: number;
		comments: string;
		spentOn: string;
		activityId: number;
	}) => {
		const task = entryToEdit as Task;
		if (task && !task.isPlaceholder) {
			// Update existing task
			handleUpdate(
				{
					duration: data.hours,
					description: data.comments,
					date: new Date(data.spentOn),
				},
				task,
			);
		} else {
			// Create new task
			handleCreateTimeEntry(data);
		}
		setIsEntryDialogOpen(false);
	};

	const handleTaskDelete = (taskId: string) => {
		handleDelete(taskId);
		setIsDetailDialogOpen(false);
	};

	const handleTaskDuplicate = (task: Task) => {
		handleDuplicate(task);
		setIsDetailDialogOpen(false);
	};

	// Placeholder mutations
	const addPlaceholderMutation = useMutation({
		mutationFn: addPlaceholderFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["placeholders"] });
		},
	});

	const updatePlaceholderMutation = useMutation({
		mutationFn: updatePlaceholderFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["placeholders"] });
		},
	});

	const deletePlaceholderMutation = useMutation({
		mutationFn: deletePlaceholderFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["placeholders"] });
		},
	});

	// Placeholder handlers
	const handlePlaceholderClick = (placeholder: TimePlaceholder) => {
		setSelectedPlaceholder(placeholder);
		setIsPlaceholderDetailDialogOpen(true);
	};

	const handlePlaceholderEdit = (placeholder: TimePlaceholder) => {
		setEntryToEdit(placeholder);
		setIsEntryDialogOpen(true);
	};

	const handlePlaceholderSave = (data: {
		type: PlaceholderType;
		date: string;
		duration: number;
		note?: string;
	}) => {
		const placeholder = entryToEdit as TimePlaceholder;
		if (placeholder?.isPlaceholder) {
			// Update existing placeholder
			updatePlaceholderMutation.mutate({
				data: {
					id: placeholder.id,
					...data,
				},
			});
		} else {
			// Create new placeholder
			addPlaceholderMutation.mutate({ data });
		}
		setIsEntryDialogOpen(false);
		setEntryToEdit(null);
	};

	const handlePlaceholderDelete = (placeholderId: string) => {
		deletePlaceholderMutation.mutate({ data: { id: placeholderId } });
	};

	return (
		<div className="min-h-full bg-background p-6">
			<div className="mx-auto max-w-7xl">
				{/* Page Header with API Key and Custom Issues buttons */}
				<PageHeader
					title="Redmine Time Entries Calendar"
					apiKeyManagement={apiKeyManagement}
					currentView="month"
					currentDate={currentDate}
				/>

				{/* Calendar Header with navigation */}
				<CalendarHeader
					currentDate={currentDate}
					totalHours={totalMonthHours}
					redmineHours={redmineMonthHours}
					placeholderHours={placeholderMonthHours}
					onPreviousWeek={handlePreviousMonth}
					onNextWeek={handleNextMonth}
					onToday={handleToday}
					onAddTask={() => {
						setSelectedDate(new Date());
						setEntryToEdit(null);
						setEntryDialogTab("timeEntry");
						setIsEntryDialogOpen(true);
					}}
				/>
				{/* Loading state */}
				{isLoading && <CalendarLoading />}

				{/* Error state */}
				{error && <CalendarError error={error} />}

				{/* Summary */}
				{!isLoading && !error && (
					<CalendarSummary
						tasks={currentMonthTasks}
						totalHours={totalMonthHours}
						redmineHours={redmineMonthHours}
						placeholderHours={placeholderMonthHours}
					/>
				)}

				{/* Calendar Grid */}
				{!isLoading && !error && (
					<CalendarGrid
						currentDate={currentDate}
						entries={entries}
						onTaskClick={handleTaskClick}
						onTaskEdit={handleTaskEdit}
						onTaskDuplicate={handleTaskDuplicate}
						onTaskDelete={handleTaskDelete}
						onPlaceholderClick={handlePlaceholderClick}
						onPlaceholderEdit={handlePlaceholderEdit}
						onPlaceholderDelete={handlePlaceholderDelete}
						onDateClick={handleDateClick}
					/>
				)}

				{/* Task Detail Dialog */}
				{selectedTask && (
					<TaskDetailDialog
						task={selectedTask}
						open={isDetailDialogOpen}
						onOpenChange={setIsDetailDialogOpen}
						onEdit={() => handleTaskEdit(selectedTask)}
						onDuplicate={() => handleTaskDuplicate(selectedTask)}
						onDelete={() => handleTaskDelete(selectedTask.id)}
					/>
				)}

				{/* Placeholder Detail Dialog */}
				{selectedPlaceholder && (
					<PlaceholderDetailDialog
						placeholder={selectedPlaceholder}
						open={isPlaceholderDetailDialogOpen}
						onOpenChange={setIsPlaceholderDetailDialogOpen}
						onEdit={() => handlePlaceholderEdit(selectedPlaceholder)}
						onDelete={() => handlePlaceholderDelete(selectedPlaceholder.id)}
					/>
				)}

				{/* Unified Entry Dialog */}
				<EntryDialog
					open={isEntryDialogOpen}
					onOpenChange={(open) => {
						setIsEntryDialogOpen(open);
						if (!open) {
							setEntryToEdit(null);
							setSelectedDate(null);
						}
					}}
					selectedDate={selectedDate || undefined}
					initialTab={entryDialogTab}
					task={entryToEdit && !entryToEdit.isPlaceholder ? entryToEdit : null}
					placeholder={
						entryToEdit &&
						"isPlaceholder" in entryToEdit &&
						entryToEdit.isPlaceholder
							? entryToEdit
							: null
					}
					onSaveTimeEntry={handleSaveTask}
					onSavePlaceholder={handlePlaceholderSave}
				/>
			</div>
		</div>
	);
}
