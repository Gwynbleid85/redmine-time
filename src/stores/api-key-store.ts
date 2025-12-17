import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ApiKeyState {
	apiKey: string | null;
	hasApiKey: boolean;
	isLoading: boolean;
	showApiKeyDialog: boolean;
	userLogin: string | null;

	// Actions
	setApiKey: (key: string) => void;
	clearApiKey: () => void;
	setShowApiKeyDialog: (show: boolean) => void;
	setIsLoading: (loading: boolean) => void;
	setUserLogin: (login: string | null) => void;
	initializeFromServer: (hasKey: boolean, userLogin?: string | null) => void;
}

export const useApiKeyStore = create<ApiKeyState>()(
	persist(
		(set) => ({
			apiKey: null,
			hasApiKey: false,
			isLoading: true,
			showApiKeyDialog: false,
			userLogin: null,

			setApiKey: (key) => set({ apiKey: key, hasApiKey: true }),
			clearApiKey: () =>
				set({ apiKey: null, hasApiKey: false, userLogin: null }),
			setShowApiKeyDialog: (show) => set({ showApiKeyDialog: show }),
			setIsLoading: (loading) => set({ isLoading: loading }),
			setUserLogin: (login) => set({ userLogin: login }),
			initializeFromServer: (hasKey, userLogin = null) =>
				set({ hasApiKey: hasKey, userLogin, isLoading: false }),
		}),
		{
			name: "api-key-storage",
			storage: createJSONStorage(() => localStorage),
			// Only persist hasApiKey status and userLogin, not the actual key (keep that in cookies for security)
			partialize: (state) => ({
				hasApiKey: state.hasApiKey,
				userLogin: state.userLogin,
			}),
		},
	),
);
