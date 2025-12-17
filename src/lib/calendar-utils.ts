import type { CalendarEntry, Task } from "./types";

export function getMonthDays(date: Date): Date[] {
	const year = date.getFullYear();
	const month = date.getMonth();

	// Get first day of the month
	const firstDay = new Date(year, month, 1);

	// Get last day of the month
	const lastDay = new Date(year, month + 1, 0);

	// Find the Monday before or on the first day
	const firstDayOfWeek = firstDay.getDay();
	const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
	const startDate = new Date(firstDay);
	startDate.setDate(firstDay.getDate() - daysToSubtract);

	// Find the Sunday after or on the last day
	const lastDayOfWeek = lastDay.getDay();
	const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
	const endDate = new Date(lastDay);
	endDate.setDate(lastDay.getDate() + daysToAdd);

	// Generate all days from start to end
	const days: Date[] = [];
	const current = new Date(startDate);

	while (current <= endDate) {
		days.push(new Date(current));
		current.setDate(current.getDate() + 1);
	}

	return days;
}

export function getWeekDays(date: Date): Date[] {
	const week: Date[] = [];
	const current = new Date(date);

	// Get Monday of the current week
	const day = current.getDay();
	const diff = current.getDate() - day + (day === 0 ? -6 : 1);
	current.setDate(diff);

	for (let i = 0; i < 7; i++) {
		week.push(new Date(current));
		current.setDate(current.getDate() + 1);
	}

	return week;
}

export function getMonthName(date: Date): string {
	return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function getDayName(date: Date): string {
	return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

export function formatHours(hours: number): string {
	return hours.toFixed(2);
}

export function getTasksForDay(tasks: Task[], date: Date): Task[] {
	return tasks.filter((task) => isSameDay(task.date, date));
}

export function getEntriesForDay(
	entries: CalendarEntry[],
	date: Date,
): CalendarEntry[] {
	return entries.filter((entry) => isSameDay(entry.date, date));
}

export function getTotalHoursForDay(tasks: Task[], date: Date): number {
	return getTasksForDay(tasks, date).reduce(
		(sum, task) => sum + task.duration,
		0,
	);
}

export function getTotalHoursForEntries(
	entries: CalendarEntry[],
	date: Date,
): number {
	return getEntriesForDay(entries, date).reduce(
		(sum, entry) => sum + entry.duration,
		0,
	);
}

export function getWeekTotalHours(tasks: Task[], weekDays: Date[]): number {
	return weekDays.reduce(
		(sum, day) => sum + getTotalHoursForDay(tasks, day),
		0,
	);
}

export function getMonthTotalHours(tasks: Task[], monthDays: Date[]): number {
	return monthDays.reduce(
		(sum, day) => sum + getTotalHoursForDay(tasks, day),
		0,
	);
}

export function isInCurrentMonth(date: Date, currentMonth: Date): boolean {
	return (
		date.getMonth() === currentMonth.getMonth() &&
		date.getFullYear() === currentMonth.getFullYear()
	);
}

export function generateId(): string {
	return Math.random().toString(36).substring(2, 9);
}
