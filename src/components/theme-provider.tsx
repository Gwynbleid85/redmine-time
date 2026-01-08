import { createContext, useContext, useEffect, useState } from "react";
import {
	getStoredTheme,
	type ResolvedTheme,
	resolveTheme,
	THEME_STORAGE_KEY,
	type Theme,
} from "@/lib/theme";

interface ThemeContextValue {
	theme: Theme;
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<Theme>("system");
	const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

	// Initialize from localStorage on mount
	useEffect(() => {
		setThemeState(getStoredTheme());
	}, []);

	// Apply theme to DOM when it changes
	useEffect(() => {
		const root = document.documentElement;
		const resolved = resolveTheme(theme);

		root.classList.remove("light", "dark");
		root.classList.add(resolved);
		setResolvedTheme(resolved);

		// Listen for system preference changes
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			if (theme === "system") {
				const newResolved = resolveTheme("system");
				root.classList.remove("light", "dark");
				root.classList.add(newResolved);
				setResolvedTheme(newResolved);
			}
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	const setTheme = (newTheme: Theme) => {
		localStorage.setItem(THEME_STORAGE_KEY, newTheme);
		setThemeState(newTheme);
	};

	return (
		<ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within ThemeProvider");
	}
	return context;
}
