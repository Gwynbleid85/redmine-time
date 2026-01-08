import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { APP_VERSION } from "@/lib/changelog-data";
import {
	getChangelogStatusFn,
	markChangelogSeenFn,
} from "@/lib/server/changelog";

/**
 * Hook for managing changelog state
 * Determines if user should see the changelog and provides function to mark as seen
 */
export function useChangelog(enabled = true) {
	const queryClient = useQueryClient();
	const getStatusFn = useServerFn(getChangelogStatusFn);
	const markSeenFn = useServerFn(markChangelogSeenFn);

	// Fetch user's last seen version (only when enabled/authenticated)
	const { data, isLoading } = useQuery({
		queryKey: ["changelog-status"],
		queryFn: () => getStatusFn(),
		enabled,
	});

	// Mutation to mark version as seen
	const markSeenMutation = useMutation({
		mutationFn: (version: string) => markSeenFn({ data: { version } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["changelog-status"] });
		},
	});

	// Determine if changelog should be shown
	const shouldShowChangelog =
		!isLoading && data?.lastSeenVersion !== APP_VERSION;

	const markAsSeen = () => {
		markSeenMutation.mutate(APP_VERSION);
	};

	return {
		shouldShowChangelog,
		markAsSeen,
		isLoading,
		lastSeenVersion: data?.lastSeenVersion ?? null,
		currentVersion: APP_VERSION,
	};
}
