import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface ChangelogDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	version: string;
	content: string;
	onMarkAsSeen?: () => void;
}

/**
 * Dialog that shows "What's New" for a specific version
 */
export function ChangelogDialog({
	open,
	onOpenChange,
	version,
	content,
	onMarkAsSeen,
}: ChangelogDialogProps) {
	const handleClose = () => {
		if (onMarkAsSeen) {
			onMarkAsSeen();
		}
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>What's New in v{version}</DialogTitle>
					<DialogDescription>
						Check out the latest features and improvements
					</DialogDescription>
				</DialogHeader>
				<div className="flex-1 overflow-y-auto">
					<Markdown
						remarkPlugins={[remarkGfm]}
						components={{
							h3: ({ children }) => (
								<h3 className="text-base font-semibold mt-4 mb-2">{children}</h3>
							),
							ul: ({ children }) => (
								<ul className="list-disc list-inside space-y-1 text-sm">
									{children}
								</ul>
							),
							li: ({ children }) => (
								<li className="text-muted-foreground">{children}</li>
							),
							p: ({ children }) => (
								<p className="text-sm text-muted-foreground mb-2">{children}</p>
							),
							code: ({ children }) => (
								<code className="bg-muted px-1 py-0.5 rounded text-xs">
									{children}
								</code>
							),
						}}
					>
						{content}
					</Markdown>
				</div>
				<DialogFooter>
					<Button onClick={handleClose}>Got it!</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
