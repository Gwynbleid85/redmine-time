import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface PlaceholderCardProps {
	placeholder: TimePlaceholder;
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

export function PlaceholderCard({
	placeholder,
	onEdit,
	onDelete,
}: PlaceholderCardProps) {
	return (
		<Card className="group relative hover:shadow-md transition-shadow border-2 border-dashed">
			<div className="p-4">
				{/* Header: Type badge and Actions */}
				<div className="flex items-start justify-between gap-3 mb-3">
					<div className="flex items-center gap-2 flex-wrap">
						<Badge
							variant="outline"
							className={cn(
								"text-xs font-semibold",
								placeholderTypeColors[placeholder.type],
							)}
						>
							{placeholder.type}
						</Badge>
						<span className="text-xs text-muted-foreground italic">
							Time Placeholder
						</span>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={onEdit}>
								<Edit className="h-4 w-4 mr-2" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={onDelete}
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
					<p className="text-sm text-muted-foreground mb-3 leading-relaxed">
						{placeholder.note}
					</p>
				)}

				{/* Footer: Duration */}
				<div className="flex items-center justify-end gap-2">
					<span className="text-lg font-bold text-primary">
						{formatDuration(placeholder.duration)}
					</span>
				</div>
			</div>
		</Card>
	);
}
