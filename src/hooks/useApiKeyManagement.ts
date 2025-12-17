import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
	checkApiKeyServerFn,
	clearApiKeyFn,
	getCurrentUserFn,
	validateAndSetApiKeyFn,
} from "@/lib/server/api-key";
import { useApiKeyStore } from "@/stores/api-key-store";

/**
 * Custom hook for managing API key state and validation
 * Handles API key checking, validation, setting, and clearing
 * Integrates with Zustand store for persistent client-side state
 */
export function useApiKeyManagement() {
	// Local state for form management
	const [apiKey, setApiKey] = useState("");
	const [apiKeyError, setApiKeyError] = useState("");
	const [isValidating, setIsValidating] = useState(false);

	// Zustand store for persistent state
	const {
		hasApiKey,
		userLogin,
		showApiKeyDialog,
		setShowApiKeyDialog,
		initializeFromServer,
		setApiKey: setStoreApiKey,
		clearApiKey: clearStoreApiKey,
		setUserLogin,
	} = useApiKeyStore();

	const queryClient = useQueryClient();
	const checkApiKey = useServerFn(checkApiKeyServerFn);
	const validateAndSetApiKey = useServerFn(validateAndSetApiKeyFn);
	const getCurrentUser = useServerFn(getCurrentUserFn);
	const clearApiKey = useServerFn(clearApiKeyFn);

	// Check if API key is set on mount and fetch user info
	useEffect(() => {
		const checkKeyAndFetchUser = async () => {
			const result = await checkApiKey();
			const hasKey = result === "true";

			if (hasKey) {
				const userInfo = await getCurrentUser();
				initializeFromServer(hasKey, userInfo.login || null);
			} else {
				initializeFromServer(hasKey);
			}
		};
		checkKeyAndFetchUser();
	}, [checkApiKey, getCurrentUser, initializeFromServer]);

	const handleApiKeySubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!apiKey.trim()) {
			setApiKeyError("Please enter your Redmine API key");
			return;
		}

		setIsValidating(true);
		setApiKeyError("");

		try {
			const result = await validateAndSetApiKey({ data: apiKey });

			if (result.success) {
				// Update Zustand store
				setStoreApiKey(apiKey);
				setShowApiKeyDialog(false);
				setApiKey("");

				// Fetch user info
				const userInfo = await getCurrentUser();
				if (userInfo.login) {
					setUserLogin(userInfo.login);
				}

				// Refresh data with new API key
				queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
				queryClient.invalidateQueries({ queryKey: ["issues"] });
			} else {
				setApiKeyError(result.error || "Failed to validate API key");
			}
		} catch (error) {
			console.error("Error validating API key:", error);
			setApiKeyError("An unexpected error occurred. Please try again.");
		} finally {
			setIsValidating(false);
		}
	};

	const handleLogout = async () => {
		await clearApiKey();
		clearStoreApiKey();
		setShowApiKeyDialog(false);
		// Clear cached data
		queryClient.clear();
	};

	return {
		hasApiKey,
		userLogin,
		isApiKeyDialogOpen: showApiKeyDialog,
		setIsApiKeyDialogOpen: setShowApiKeyDialog,
		apiKey,
		setApiKey,
		apiKeyError,
		setApiKeyError,
		isValidating,
		handleApiKeySubmit,
		handleLogout,
	};
}
