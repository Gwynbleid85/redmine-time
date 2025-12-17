import { Key } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiKeyButtonProps {
	hasApiKey: boolean;
	userLogin: string | null;
	onClick: () => void;
}

/**
 * Button to open API key dialog
 * Shows different states based on whether key is configured
 */
export function ApiKeyButton({
	hasApiKey,
	userLogin,
	onClick,
}: ApiKeyButtonProps) {
	return (
		<Button
			onClick={onClick}
			variant={hasApiKey ? "outline" : "default"}
			className={`flex items-center gap-2 ${
				hasApiKey
					? "border-green-500 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950"
					: ""
			}`}
		>
			<Key className="h-4 w-4" />
			{hasApiKey && userLogin
				? `${userLogin}`
				: hasApiKey
					? "Update API Key"
					: "Set API Key"}
		</Button>
	);
}
