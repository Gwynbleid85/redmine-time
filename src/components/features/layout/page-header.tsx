import { useNavigate } from "@tanstack/react-router";
import { Key, ListTodo, LogOut, Monitor, Moon, Sun, User } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { ApiKeyDialog } from "@/components/features/api-key/api-key-dialog";
import { ApiKeyWarning } from "@/components/features/api-key/api-key-warning";
import { CustomIssuesDialog } from "@/components/features/custom-issues/custom-issues-dialog";
import { ViewSwitcher } from "@/components/features/navigation/view-switcher";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
	const { theme, setTheme } = useTheme();
	const [isCustomIssuesDialogOpen, setIsCustomIssuesDialogOpen] =
		useState(false);

	const handleSignOut = async () => {
		await signOut();
		navigate({ to: "/login" });
	};

	const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

	return (
		<>
			{/* Header with title and action buttons */}
			<div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
				<h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="gap-2">
							<User className="h-4 w-4" />
							{apiKeyManagement.userLogin || "Menu"}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						{showCustomIssues && (
							<DropdownMenuItem
								onClick={() => setIsCustomIssuesDialogOpen(true)}
								className="gap-2"
							>
								<ListTodo className="h-4 w-4" />
								Custom Issues
							</DropdownMenuItem>
						)}

						<DropdownMenuItem
							onClick={() => apiKeyManagement.setIsApiKeyDialogOpen(true)}
							className="gap-2"
						>
							<Key className="h-4 w-4" />
							API Key
							{!apiKeyManagement.hasApiKey && (
								<span className="ml-auto text-xs text-destructive">!</span>
							)}
						</DropdownMenuItem>

						<DropdownMenuSub>
							<DropdownMenuSubTrigger className="gap-2">
								<ThemeIcon className="h-4 w-4" />
								Theme
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent>
								<DropdownMenuItem
									onClick={() => setTheme("light")}
									className="gap-2"
								>
									<Sun className="h-4 w-4" />
									Light
									{theme === "light" && <span className="ml-auto">✓</span>}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setTheme("dark")}
									className="gap-2"
								>
									<Moon className="h-4 w-4" />
									Dark
									{theme === "dark" && <span className="ml-auto">✓</span>}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setTheme("system")}
									className="gap-2"
								>
									<Monitor className="h-4 w-4" />
									System
									{theme === "system" && <span className="ml-auto">✓</span>}
								</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuSub>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							onClick={handleSignOut}
							className="gap-2 text-destructive focus:text-destructive"
						>
							<LogOut className="h-4 w-4" />
							Logout
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
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
