/**
 * @deprecated This file is deprecated. Please use the new organized structure:
 * - Import from '@/lib/server/api-key' for API key functions
 *
 * This file is kept for backward compatibility but will be removed in a future version.
 */

// Re-export for backward compatibility
export {
	checkApiKeyServerFn,
	clearApiKeyFn,
	getCurrentUserFn,
	validateAndSetApiKeyFn,
} from "./server/api-key";
