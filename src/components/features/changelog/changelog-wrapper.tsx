import { type ReactNode, useState } from "react";
import { useChangelog } from "@/hooks/useChangelog";
import { APP_VERSION, getLatestChangelog } from "@/lib/changelog-data";
import { ChangelogDialog } from "./changelog-dialog";
import { ChangelogHistoryDialog } from "./changelog-history-dialog";

interface ChangelogWrapperProps {
	isAuthenticated: boolean;
	children: (openHistory: () => void) => ReactNode;
}

/**
 * Wrapper component that manages all changelog state and dialogs
 * Handles both auto-show for new versions and manual history viewing
 * Uses render props pattern to provide openHistory callback to children
 */
export function ChangelogWrapper({
	isAuthenticated,
	children,
}: ChangelogWrapperProps) {
	const [showHistory, setShowHistory] = useState(false);

	// Changelog hook - only fetches when authenticated
	const changelog = useChangelog(isAuthenticated);
	const latestEntry = getLatestChangelog();

	const openHistory = () => setShowHistory(true);

	return (
		<>
			{children(openHistory)}

			{isAuthenticated && (
				<>
					{/* Auto-show changelog for new version */}
					{changelog.shouldShowChangelog && latestEntry && (
						<ChangelogDialog
							open={true}
							onOpenChange={() => {}}
							version={latestEntry.version}
							content={latestEntry.content}
							onMarkAsSeen={changelog.markAsSeen}
						/>
					)}

					{/* Changelog history dialog */}
					<ChangelogHistoryDialog
						open={showHistory}
						onOpenChange={setShowHistory}
					/>
				</>
			)}
		</>
	);
}

interface ChangelogVersionLinkProps {
	onClick: () => void;
}

/**
 * Clickable version link component for the footer
 * Shows the current app version and opens changelog history on click
 */
export function ChangelogVersionLink({ onClick }: ChangelogVersionLinkProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="hover:underline focus:outline-none focus:underline"
		>
			v{APP_VERSION}
		</button>
	);
}
