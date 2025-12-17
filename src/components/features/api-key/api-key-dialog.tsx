import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ApiKeyDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	apiKey: string;
	setApiKey: (key: string) => void;
	apiKeyError: string;
	setApiKeyError: (error: string) => void;
	isValidating: boolean;
	hasApiKey: boolean;
	onSubmit: (e: React.FormEvent) => void;
	onLogout: () => void;
}

/**
 * Dialog for managing API key
 * Allows user to set, update, or clear their Redmine API key
 */
export function ApiKeyDialog({
	open,
	onOpenChange,
	apiKey,
	setApiKey,
	apiKeyError,
	setApiKeyError,
	isValidating,
	hasApiKey,
	onSubmit,
	onLogout,
}: ApiKeyDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Redmine API Key</DialogTitle>
					<DialogDescription>
						Enter your Redmine API key to access your time entries. You can find
						it in your Redmine account settings under "API access key".
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-4">
					<div>
						<Input
							type="text"
							placeholder="API Key"
							value={apiKey}
							onChange={(e) => {
								setApiKey(e.target.value);
								setApiKeyError("");
							}}
							disabled={isValidating}
							required
						/>
						{apiKeyError && (
							<p className="text-red-500 text-sm mt-2">{apiKeyError}</p>
						)}
					</div>
					<div
						className={`flex gap-2 ${hasApiKey ? "justify-between" : "justify-end"}`}
					>
						{hasApiKey && (
							<Button
								type="button"
								variant="destructive"
								onClick={onLogout}
								disabled={isValidating}
							>
								Clean current
							</Button>
						)}
						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									onOpenChange(false);
									setApiKey("");
									setApiKeyError("");
								}}
								disabled={isValidating}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isValidating}>
								{isValidating ? "Validating..." : "Save"}
							</Button>
						</div>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
