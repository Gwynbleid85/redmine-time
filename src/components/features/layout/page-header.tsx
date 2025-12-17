import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { ApiKeyButton } from "@/components/features/api-key/api-key-button";
import { ApiKeyDialog } from "@/components/features/api-key/api-key-dialog";
import { ApiKeyWarning } from "@/components/features/api-key/api-key-warning";
import { CustomIssuesButton } from "@/components/features/custom-issues/custom-issues-button";
import { CustomIssuesDialog } from "@/components/features/custom-issues/custom-issues-dialog";
import { ViewSwitcher } from "@/components/features/navigation/view-switcher";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

interface PageHeaderProps {
	title: string;
	apiKeyManagement: {
		hasApiKey: boolean;
		userLogin: string | null;
		isApiKeyDialogOpen: boolean;
		setIsApiKeyDialogOpen: (open: boolean) => void;
		apiKey: string;
		setApiKey: (key: string) => void;
		apiKeyError: string;
		setApiKeyError: (error: string) => void;
		isValidating: boolean;
		handleApiKeySubmit: (e: React.FormEvent) => Promise<void>;
		handleLogout: () => Promise<void>;
	};
	showCustomIssues?: boolean;
	currentView?: "month" | "day";
	currentDate?: Date;
}

export function PageHeader({
	title,
	apiKeyManagement,
	showCustomIssues = true,
	currentView,
	currentDate,
}: PageHeaderProps) {
	const navigate = useNavigate();
	const [isCustomIssuesDialogOpen, setIsCustomIssuesDialogOpen] =
		useState(false);

	const handleSignOut = async () => {
		await signOut();
		navigate({ to: "/login" });
	};

	return (
		<>
			{/* Header with title and action buttons */}
			<div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
				<h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
				<div className="flex gap-2">
					{showCustomIssues && (
						<CustomIssuesButton
							onClick={() => setIsCustomIssuesDialogOpen(true)}
						/>
					)}
					<ApiKeyButton
						hasApiKey={apiKeyManagement.hasApiKey}
						userLogin={apiKeyManagement.userLogin}
						onClick={() => apiKeyManagement.setIsApiKeyDialogOpen(true)}
					/>
					<Button variant="outline" size="sm" onClick={handleSignOut}>
						<LogOut className="h-4 w-4 mr-2" />
						Logout
					</Button>
				</div>
			</div>

			{/* API Key Warning */}
			{!apiKeyManagement.hasApiKey && <ApiKeyWarning />}

			{/* View Switcher */}
			{currentView && currentDate && (
				<div className="mb-6 flex justify-center w-full">
					<div className="w-full max-w-[200px]">
						<ViewSwitcher currentView={currentView} currentDate={currentDate} />
					</div>
				</div>
			)}

			{/* API Key Dialog */}
			<ApiKeyDialog
				open={apiKeyManagement.isApiKeyDialogOpen}
				onOpenChange={apiKeyManagement.setIsApiKeyDialogOpen}
				apiKey={apiKeyManagement.apiKey}
				setApiKey={apiKeyManagement.setApiKey}
				apiKeyError={apiKeyManagement.apiKeyError}
				setApiKeyError={apiKeyManagement.setApiKeyError}
				isValidating={apiKeyManagement.isValidating}
				hasApiKey={apiKeyManagement.hasApiKey}
				onSubmit={apiKeyManagement.handleApiKeySubmit}
				onLogout={apiKeyManagement.handleLogout}
			/>

			{/* Custom Issues Dialog */}
			{showCustomIssues && (
				<CustomIssuesDialog
					open={isCustomIssuesDialogOpen}
					onOpenChange={setIsCustomIssuesDialogOpen}
				/>
			)}
		</>
	);
}
