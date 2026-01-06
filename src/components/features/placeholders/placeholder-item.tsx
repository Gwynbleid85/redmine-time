"use client";

import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TimePlaceholder } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";

interface PlaceholderItemProps {
	placeholder: TimePlaceholder;
	onClick?: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

const placeholderTypeColors = {
	Doctor: "bg-orange-500",
	Vacation: "bg-cyan-500",
	Holiday: "bg-pink-500",
	Sickday: "bg-emerald-500",
};

export function PlaceholderItem({
	placeholder,
	onClick,
	onEdit,
	onDelete,
}: PlaceholderItemProps) {
	return (
		<Card
			className="group relative p-3 hover:shadow-md transition-shadow border-dashed border-2 cursor-pointer"
			onClick={onClick}
		>
			<div>
				<div className="flex items-start justify-between gap-2 mb-2">
					<div className="flex items-center gap-2">
						{/* Colored dot indicator */}
						<div
							className={cn(
								"h-2 w-2 rounded-full",
								placeholderTypeColors[placeholder.type],
							)}
						/>

						{/* Placeholder type */}
						<h4 className="text-sm font-medium leading-snug">
							{placeholder.type}
						</h4>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
								onClick={(e) => e.stopPropagation()}
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

				{/* Note (if present) */}
				{placeholder.note && (
					<p className="text-xs text-muted-foreground italic line-clamp-2 mb-1">
						{placeholder.note}
					</p>
				)}

				{/* Duration */}
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<span className="italic">Time Placeholder</span>
					<span>•</span>
					<span className="font-semibold">
						{formatDuration(placeholder.duration)}
					</span>
				</div>
			</div>
		</Card>
	);
}
