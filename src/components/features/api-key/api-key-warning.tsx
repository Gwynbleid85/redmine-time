import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Warning alert shown when API key is not configured
 */
export function ApiKeyWarning() {
	return (
		<Alert variant="destructive" className="mb-6">
			<AlertCircle className="h-4 w-4" />
			<AlertTitle>API Key Not Configured</AlertTitle>
			<AlertDescription>
				You need to set your Redmine API key to view and manage time entries.
				Click the "Set API Key" button above to configure it.
			</AlertDescription>
		</Alert>
	);
}
