import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createTimeEntry,
	deleteTimeEntry,
	duplicateTimeEntry,
	updateTimeEntry,
} from "@/lib/api.redmine";
import { extractRedmineId } from "@/lib/redmine-utils";
import type { Task } from "@/lib/types";

/**
 * Custom hook for time entry mutations (create, update, delete, duplicate)
 * Handles all CRUD operations for time entries
 */
export function useTimeEntryMutations() {
	const queryClient = useQueryClient();

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: (params: {
			id: number;
			hours?: number;
			comments?: string;
			spentOn?: string;
		}) =>
			updateTimeEntry({
				data: params,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
		},
		onError: (error) => {
			console.error("Failed to update time entry:", error);
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: (id: number) =>
			deleteTimeEntry({
				data: { id },
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
		},
		onError: (error) => {
			console.error("Failed to delete time entry:", error);
		},
	});

	// Duplicate mutation
	const duplicateMutation = useMutation({
		mutationFn: async (id: number) => {
			console.log("Duplicating time entry with id:", id);
			await duplicateTimeEntry({
				data: { id },
			});
		},
		onSuccess: () => {
			console.log("Successfully duplicated time entry");
			queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
		},
		onError: (error) => {
			console.error("Failed to duplicate time entry:", error);
		},
	});

	// Create mutation
	const createMutation = useMutation({
		mutationFn: (params: {
			issueId: number;
			hours: number;
			comments: string;
			spentOn: string;
			activityId: number;
		}) =>
			createTimeEntry({
				data: params,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
		},
		onError: (error) => {
			console.error("Failed to create time entry:", error);
		},
	});

	// Handler functions
	const handleUpdate = (task: Partial<Task>, taskToEdit: Task) => {
		const taskId = extractRedmineId(taskToEdit.id);
		if (taskId === null) {
			console.error("Invalid task id for update:", taskToEdit.id);
			return;
		}

		updateMutation.mutate({
			id: taskId,
			hours: task.duration,
			comments: task.description,
			spentOn: task.date ? task.date.toISOString().split("T")[0] : undefined,
		});
	};

	const handleCreate = (task: Partial<Task>) => {
		// Extract issue ID from taskId field (e.g., "#186933" -> 186933)
		let issueId: number | undefined;
		if (task.taskId) {
			const id = Number.parseInt(task.taskId.replace("#", ""), 10);
			if (!Number.isNaN(id)) {
				issueId = id;
			}
		}

		if (!issueId) {
			console.error("Issue ID is required to create a time entry");
			return;
		}

		createMutation.mutate({
			issueId,
			hours: task.duration || 1,
			comments: task.title || "",
			spentOn: task.date
				? task.date.toISOString().split("T")[0]
				: new Date().toISOString().split("T")[0],
			activityId: 9, // TODO: Map from task.type to activity ID
		});
	};

	const handleCreateTimeEntry = (params: {
		issueId: number;
		hours: number;
		comments: string;
		spentOn: string;
		activityId: number;
	}) => {
		createMutation.mutate(params);
	};

	const handleDelete = (taskId: string) => {
		const id = extractRedmineId(taskId);
		if (id !== null) {
			deleteMutation.mutate(id);
		} else {
			console.error("Invalid task id for deletion:", taskId);
		}
	};

	const handleDuplicate = (task: Task) => {
		const taskId = extractRedmineId(task.id);
		if (taskId !== null) {
			console.log("Duplicating task with id:", taskId);
			duplicateMutation.mutateAsync(taskId);
		} else {
			console.error("Invalid task id:", task.id);
		}
	};

	return {
		updateMutation,
		deleteMutation,
		duplicateMutation,
		createMutation,
		handleUpdate,
		handleCreate,
		handleCreateTimeEntry,
		handleDelete,
		handleDuplicate,
	};
}
