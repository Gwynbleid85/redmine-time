import { Copy, Edit, MoreVertical, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface DailyEntryCardProps {
	task: Task;
	onClick: () => void;
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

export function DailyEntryCard({
	task,
	onClick,
	onEdit,
	onDuplicate,
	onDelete,
}: DailyEntryCardProps) {
	return (
		<Card className="group relative hover:shadow-md transition-shadow">
			<div
				onClick={onClick}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						onClick();
					}
				}}
				role="button"
				tabIndex={0}
				className="cursor-pointer p-4"
			>
				{/* Header: Type badge, Issue ID, and Actions */}
				<div className="flex items-start justify-between gap-3 mb-3">
					<div className="flex items-center gap-2 flex-wrap">
						<Badge
							variant="outline"
							className={cn("text-xs", taskTypeColors[task.type])}
						>
							{task.type}
						</Badge>
						{task.taskId && (
							<span className="text-sm text-primary font-mono font-medium">
								{task.taskId}
							</span>
						)}
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
							>
								<MoreVertical className="h-4 w-4" />
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

				{/* Title/Comments */}
				<h3 className="font-semibold text-base mb-2 leading-snug">
					{task.title}
				</h3>

				{/* Issue Subject */}
				{task.issueSubject && (
					<p className="text-sm text-muted-foreground mb-3 leading-relaxed">
						{task.issueSubject}
					</p>
				)}

				{/* Footer: Duration and Metadata */}
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-3 text-sm text-muted-foreground">
						{task.issueTracker && (
							<>
								<span>{task.issueTracker}</span>
								<span>•</span>
							</>
						)}
						{task.issueStatus && <span>{task.issueStatus}</span>}
					</div>

					<div className="flex items-center gap-2">
						<span className="text-lg font-bold text-primary">
							{formatDuration(task.duration)}
						</span>
					</div>
				</div>
			</div>
		</Card>
	);
}
