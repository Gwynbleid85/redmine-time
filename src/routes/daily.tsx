import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { CalendarError } from "@/components/features/calendar/calendar-error";
import { CalendarLoading } from "@/components/features/calendar/calendar-loading";
import { DailyEntryList } from "@/components/features/daily/daily-entry-list";
import { DailyHeader } from "@/components/features/daily/daily-header";
import { PageHeader } from "@/components/features/layout/page-header";
import { EntryDialog } from "@/components/features/time-entries/entry-dialog";
import { TaskDetailDialog } from "@/components/features/time-entries/task-detail-dialog";
import { useApiKeyManagement } from "@/hooks/useApiKeyManagement";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useTimeEntryMutations } from "@/hooks/useTimeEntryMutations";
import { requireAuth } from "@/lib/auth-utils";
import {
	getEntriesForDay,
	getTotalHoursForEntries,
} from "@/lib/calendar-utils";
import {
	addPlaceholderFn,
	deletePlaceholderFn,
	updatePlaceholderFn,
} from "@/lib/server/time-placeholders";
import type { PlaceholderType, Task, TimePlaceholder } from "@/lib/types";

const dailySearchSchema = z.object({
	year: z.coerce.number().int().min(1900).max(2100).optional(),
	month: z.coerce.number().int().min(0).max(11).optional(),
	day: z.coerce.number().int().min(1).max(31).optional(),
});

export const Route = createFileRoute("/daily")({
	component: DailyPage,
	beforeLoad: requireAuth,
	validateSearch: (search) => dailySearchSchema.parse(search),
});

function DailyPage() {
	// Dialog state for tasks
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

	// Unified entry dialog state
	const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
	const [entryDialogTab, setEntryDialogTab] = useState<
		"timeEntry" | "placeholder"
	>("timeEntry");
	const [entryToEdit, setEntryToEdit] = useState<Task | TimePlaceholder | null>(
		null,
	);

	const queryClient = useQueryClient();

	// Get date from URL search params
	const search = Route.useSearch();
	const navigate = useNavigate();

	// Derive currentDate from search params (default to today)
	const now = new Date();
	const year = search.year ?? now.getFullYear();
	const month = search.month ?? now.getMonth();
	const day = search.day ?? now.getDate();
	const currentDate = useMemo(
		() => new Date(year, month, day),
		[year, month, day],
	);

	// Navigation handlers that update URL
	const handlePreviousDay = () => {
		const prevDate = new Date(currentDate);
		prevDate.setDate(prevDate.getDate() - 1);
		navigate({
			to: "/daily",
			search: {
				year: prevDate.getFullYear(),
				month: prevDate.getMonth(),
				day: prevDate.getDate(),
			},
		});
	};

	const handleNextDay = () => {
		const nextDate = new Date(currentDate);
		nextDate.setDate(nextDate.getDate() + 1);
		navigate({
			to: "/daily",
			search: {
				year: nextDate.getFullYear(),
				month: nextDate.getMonth(),
				day: nextDate.getDate(),
			},
		});
	};

	const handleToday = () => {
		const today = new Date();
		navigate({
			to: "/daily",
			search: {
				year: today.getFullYear(),
				month: today.getMonth(),
				day: today.getDate(),
			},
		});
	};

	const handleDateSelect = (date: Date) => {
		navigate({
			to: "/daily",
			search: {
				year: date.getFullYear(),
				month: date.getMonth(),
				day: date.getDate(),
			},
		});
	};

	// Fetch time entries for the month containing this day
	const monthDate = useMemo(() => new Date(year, month, 1), [year, month]);
	const { entries: allEntries, isLoading, error } = useTimeEntries(monthDate);

	const { handleUpdate, handleCreateTimeEntry, handleDelete, handleDuplicate } =
		useTimeEntryMutations();

	const apiKeyManagement = useApiKeyManagement();

	// Filter entries for current day
	const dayEntries = useMemo(() => {
		return getEntriesForDay(allEntries, currentDate);
	}, [allEntries, currentDate]);

	// Calculate total hours and breakdown
	const totalHours = useMemo(() => {
		return getTotalHoursForEntries(allEntries, currentDate);
	}, [allEntries, currentDate]);

	const redmineHours = useMemo(() => {
		return dayEntries
			.filter((entry) => !("isPlaceholder" in entry && entry.isPlaceholder))
			.reduce((sum, entry) => sum + entry.duration, 0);
	}, [dayEntries]);

	const placeholderHours = useMemo(() => {
		return dayEntries
			.filter((entry) => "isPlaceholder" in entry && entry.isPlaceholder)
			.reduce((sum, entry) => sum + entry.duration, 0);
	}, [dayEntries]);

	// Task interaction handlers
	const handleTaskClick = (task: Task) => {
		setSelectedTask(task);
		setIsDetailDialogOpen(true);
	};

	const handleTaskEdit = (task: Task) => {
		setEntryToEdit(task);
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
					issueId: data.issueId,
					duration: data.hours,
					description: data.comments,
					date: new Date(data.spentOn),
					activityId: data.activityId,
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
		<div className="min-h-full bg-background">
			<div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
				{/* Page Header with API Key and Custom Issues buttons */}
				<PageHeader
					title="Daily View"
					apiKeyManagement={apiKeyManagement}
					currentView="day"
					currentDate={currentDate}
				/>
				<DailyHeader
					currentDate={currentDate}
					totalHours={totalHours}
					redmineHours={redmineHours}
					placeholderHours={placeholderHours}
					onPreviousDay={handlePreviousDay}
					onNextDay={handleNextDay}
					onToday={handleToday}
					onAddTask={() => {
						setEntryToEdit(null);
						setEntryDialogTab("timeEntry");
						setIsEntryDialogOpen(true);
					}}
					onDateSelect={handleDateSelect}
				/>
				{/* Loading state */}
				{isLoading && <CalendarLoading />}

				{/* Error state */}
				{error && <CalendarError error={error} />}

				{/* Daily Entry List */}
				{!isLoading && !error && (
					<DailyEntryList
						entries={dayEntries}
						onTaskClick={handleTaskClick}
						onTaskEdit={handleTaskEdit}
						onTaskDuplicate={handleTaskDuplicate}
						onTaskDelete={handleTaskDelete}
						onPlaceholderEdit={handlePlaceholderEdit}
						onPlaceholderDelete={handlePlaceholderDelete}
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

				{/* Unified Entry Dialog */}
				<EntryDialog
					open={isEntryDialogOpen}
					onOpenChange={(open) => {
						setIsEntryDialogOpen(open);
						if (!open) setEntryToEdit(null);
					}}
					selectedDate={currentDate}
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
