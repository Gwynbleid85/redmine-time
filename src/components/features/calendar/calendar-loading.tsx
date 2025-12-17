/**
 * Loading state for calendar data
 */
export function CalendarLoading() {
	return (
		<div className="text-center py-12">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
			<p className="mt-4 text-muted-foreground">Loading time entries...</p>
		</div>
	);
}
