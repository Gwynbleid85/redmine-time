import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Format decimal hours to HH:MM format
 * @param hours - Duration in decimal hours (e.g., 1.5 = 1h 30m)
 * @returns Formatted string in HH:MM format
 */
export function formatDuration(hours: number): string {
	const totalMinutes = Math.round(hours * 60);
	const h = Math.floor(totalMinutes / 60);
	const m = totalMinutes % 60;
	return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Parse duration input that can be either decimal hours or HH:MM format
 * @param input - Duration string (e.g., "1.5", "1,5", "01:30", "1:30")
 * @returns Duration in decimal hours, or null if invalid
 */
export function parseDuration(input: string): number | null {
	const trimmed = input.trim();
	if (!trimmed) return null;

	// Check for HH:MM or H:MM format
	const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
	if (timeMatch) {
		const hours = Number.parseInt(timeMatch[1], 10);
		const minutes = Number.parseInt(timeMatch[2], 10);
		if (minutes >= 60) return null;
		return hours + minutes / 60;
	}

	// Handle decimal format (supports both . and , as decimal separator)
	const normalized = trimmed.replace(",", ".");
	const decimal = Number.parseFloat(normalized);
	if (Number.isNaN(decimal) || decimal < 0) return null;

	return decimal;
}
