import { useState } from "react";

/**
 * Custom hook for managing calendar navigation state
 * Handles current date, month navigation, and today button
 */
export function useCalendarNavigation(initialDate: Date = new Date()) {
	const [currentDate, setCurrentDate] = useState(initialDate);

	const handlePreviousMonth = () => {
		setCurrentDate(
			new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
		);
	};

	const handleNextMonth = () => {
		setCurrentDate(
			new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
		);
	};

	const handleToday = () => {
		setCurrentDate(new Date());
	};

	return {
		currentDate,
		handlePreviousMonth,
		handleNextMonth,
		handleToday,
	};
}
