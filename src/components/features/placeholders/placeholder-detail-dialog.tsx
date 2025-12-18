"use client";

import { Calendar, Clock, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { TimePlaceholder } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";

interface PlaceholderDetailDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	placeholder: TimePlaceholder | null;
	onEdit: () => void;
	onDelete: () => void;
}

const placeholderTypeColors = {
	Doctor:
		"bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
	Vacation:
		"bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
	Holiday: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
};

export function PlaceholderDetailDialog({
	open,
	onOpenChange,
	placeholder,
	onEdit,
	onDelete,
}: PlaceholderDetailDialogProps) {
	if (!placeholder) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<DialogTitle className="text-xl mb-2">
								{placeholder.type}
							</DialogTitle>
							<div className="flex items-center gap-2 flex-wrap">
								<Badge
									variant="outline"
									className={cn(
										"text-xs",
										placeholderTypeColors[placeholder.type],
									)}
								>
									Time Placeholder
								</Badge>
							</div>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="flex items-center gap-3 text-sm">
						<Calendar className="h-4 w-4 text-muted-foreground" />
						<span className="text-muted-foreground">Date:</span>
						<span className="font-medium">
							{placeholder.date.toLocaleDateString("en-US", {
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
						<span className="font-medium">
							{formatDuration(placeholder.duration)}
						</span>
					</div>

					{placeholder.note && (
						<div className="space-y-2">
							<DialogDescription className="text-sm font-medium text-foreground">
								Note
							</DialogDescription>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{placeholder.note}
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
