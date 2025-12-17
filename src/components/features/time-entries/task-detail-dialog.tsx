"use client";

import { Calendar, Clock, Copy, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Task } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";

interface TaskDetailDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	task: Task | null;
	onEdit: () => void;
	onDuplicate: () => void;
	onDelete: () => void;
}

const taskTypeColors = {
	Epic: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
	Task: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
	Bug: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
	Feature:
		"bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
};

export function TaskDetailDialog({
	open,
	onOpenChange,
	task,
	onEdit,
	onDuplicate,
	onDelete,
}: TaskDetailDialogProps) {
	if (!task) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<DialogTitle className="text-xl mb-2">{task.title}</DialogTitle>
							<div className="flex items-center gap-2 flex-wrap">
								<Badge
									variant="outline"
									className={cn("text-xs", taskTypeColors[task.type])}
								>
									{task.type}
								</Badge>
								{task.taskId && (
									<span className="text-sm text-primary font-mono">
										{task.taskId}
									</span>
								)}
							</div>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="flex items-center gap-3 text-sm">
						<Calendar className="h-4 w-4 text-muted-foreground" />
						<span className="text-muted-foreground">Date:</span>
						<span className="font-medium">
							{task.date.toLocaleDateString("en-US", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</span>
					</div>

					<div className="flex items-center gap-3 text-sm">
						<Clock className="h-4 w-4 text-muted-foreground" />
						<span className="text-muted-foreground">Duration:</span>
						<span className="font-medium">{formatDuration(task.duration)}</span>
					</div>

					{task.description && (
						<div className="space-y-2">
							<DialogDescription className="text-sm font-medium text-foreground">
								Description
							</DialogDescription>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{task.description}
							</p>
						</div>
					)}
				</div>

				<div className="flex items-center gap-2 pt-4 border-t">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							onEdit();
							onOpenChange(false);
						}}
						className="gap-2"
					>
						<Edit className="h-4 w-4" />
						Edit
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							onDuplicate();
							onOpenChange(false);
						}}
						className="gap-2"
					>
						<Copy className="h-4 w-4" />
						Duplicate
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							onDelete();
							onOpenChange(false);
						}}
						className="gap-2 text-destructive hover:text-destructive ml-auto"
					>
						<Trash2 className="h-4 w-4" />
						Delete
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
