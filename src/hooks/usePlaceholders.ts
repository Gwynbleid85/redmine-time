import { useQuery } from "@tanstack/react-query";
import { getPlaceholdersFn } from "@/lib/server/time-placeholders";
import type { TimePlaceholder } from "@/lib/types";

/**
 * Custom hook for fetching time placeholders
 */
export function usePlaceholders(dateRange: { from: string; to: string }) {
	return useQuery({
		queryKey: ["placeholders", dateRange.from, dateRange.to],
		queryFn: async (): Promise<TimePlaceholder[]> => {
			const data = await getPlaceholdersFn({
				data: dateRange,
			});

			// Transform server data to TimePlaceholder type
			return data.map((p) => ({
				id: p.id,
				type: p.type,
				date: new Date(p.date),
				duration: p.duration,
				note: p.note,
				isPlaceholder: true as const,
			}));
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}
