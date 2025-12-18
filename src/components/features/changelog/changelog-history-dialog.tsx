import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CHANGELOG_ENTRIES } from "@/lib/changelog-data";

interface ChangelogHistoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Dialog showing full changelog history
 */
export function ChangelogHistoryDialog({
	open,
	onOpenChange,
}: ChangelogHistoryDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>Changelog History</DialogTitle>
					<DialogDescription>
						All changes and updates to the application
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="flex-1">
					<div className="space-y-6 pr-4">
						{CHANGELOG_ENTRIES.map((entry) => (
							<div
								key={entry.version}
								className="border-b pb-4 last:border-b-0"
							>
								<div className="mb-3">
									<h3 className="text-lg font-semibold">
										Version {entry.version}
									</h3>
									<p className="text-sm text-muted-foreground">{entry.date}</p>
								</div>
								<Markdown
									remarkPlugins={[remarkGfm]}
									components={{
										h3: ({ children }) => (
											<h3 className="text-sm font-semibold mt-3 mb-1">
												{children}
											</h3>
										),
										ul: ({ children }) => (
											<ul className="list-disc list-inside space-y-0.5 text-sm">
												{children}
											</ul>
										),
										li: ({ children }) => (
											<li className="text-muted-foreground text-sm">
												{children}
											</li>
										),
										p: ({ children }) => (
											<p className="text-sm text-muted-foreground mb-1">
												{children}
											</p>
										),
										code: ({ children }) => (
											<code className="bg-muted px-1 py-0.5 rounded text-xs">
												{children}
											</code>
										),
									}}
								>
									{entry.content}
								</Markdown>
							</div>
						))}
						{CHANGELOG_ENTRIES.length === 0 && (
							<p className="text-muted-foreground text-center py-8">
								No changelog entries found
							</p>
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
