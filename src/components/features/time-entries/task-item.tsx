"use client";

import { Copy, Edit, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";

interface TaskItemProps {
	task: Task;
	onClick: () => void;
	onEdit: () => void;
	onDuplicate: () => void;
	onDelete: () => void;
}

const taskTypeColors = {
	Epic: "bg-blue-500",
	Task: "bg-green-500",
	Bug: "bg-red-500",
	Feature: "bg-purple-500",
};

export function TaskItem({
	task,
	onClick,
	onEdit,
	onDuplicate,
	onDelete,
}: TaskItemProps) {
	return (
		<Card className="group relative p-3 hover:shadow-md transition-shadow">
			<button
				type="button"
				onClick={onClick}
				className="cursor-pointer w-full text-left"
			>
				<div className="flex items-start justify-between gap-2 mb-2">
					<div className="flex items-center gap-2">
						{/* Colored dot indicator */}
						<div
							className={cn("h-2 w-2 rounded-full", taskTypeColors[task.type])}
						/>

						{/* Issue subject or title */}
						<h4 className="text-sm font-medium leading-snug text-balance">
							{task.title}
						</h4>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<MoreVertical className="h-3 w-3" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									onEdit();
								}}
							>
								<Edit className="h-4 w-4 mr-2" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									onDuplicate();
								}}
							>
								<Copy className="h-4 w-4 mr-2" />
								Duplicate
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									onDelete();
								}}
								className="text-destructive focus:text-destructive"
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Description / Activity - Project */}
				<p className="text-xs text-muted-foreground italic line-clamp-2 mb-1">
					{task.issueSubject}
				</p>

				{/* Task ID / Duration */}
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					{task.taskId && (
						<span className="text-primary font-mono">{task.taskId}</span>
					)}
					<span>•</span>
					<span className="font-semibold">{formatDuration(task.duration)}</span>
				</div>
			</button>
		</Card>
	);
}
