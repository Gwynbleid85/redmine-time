interface CalendarErrorProps {
	error: Error;
}

/**
 * Error state for calendar data loading
 */
export function CalendarError({ error }: CalendarErrorProps) {
	return (
		<div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mt-4">
			<p className="font-bold">Error loading time entries</p>
			<p className="text-sm">{error.message}</p>
			<p className="text-xs mt-2">
				Make sure your .env file is configured with valid Redmine credentials.
			</p>
		</div>
	);
}
