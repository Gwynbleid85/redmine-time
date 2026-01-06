export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

/**
 * Resolve theme preference to actual light/dark value
 * Must be called client-side only
 */
export function resolveTheme(theme: Theme): ResolvedTheme {
	if (theme === "system") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}
	return theme;
}

/**
 * Get stored theme from localStorage
 * Must be called client-side only
 */
export function getStoredTheme(): Theme {
	const stored = localStorage.getItem(THEME_STORAGE_KEY);
	if (stored === "light" || stored === "dark" || stored === "system") {
		return stored;
	}
	return "system";
}

/**
 * Minimal inline script to prevent flash of unstyled content (FOUC)
 * This runs before React hydrates to apply the correct theme class immediately
 *
 * Note: dangerouslySetInnerHTML is the standard pattern for this use case
 * and is used by next-themes and similar libraries
 */
export const themeScript = `!function(){var e=document.documentElement,t=localStorage.getItem("theme");e.classList.add("light"===t||"dark"===t?t:matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light")}();`;
