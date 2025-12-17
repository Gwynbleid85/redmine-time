import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import type React from "react";
import { useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getIssues } from "@/lib/api.redmine";
import {
	addCustomIssueFn,
	deleteCustomIssueFn,
	getCustomIssuesFn,
} from "@/lib/server/custom-issues";

interface CustomIssuesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CustomIssuesDialog({
	open,
	onOpenChange,
}: CustomIssuesDialogProps) {
	const queryClient = useQueryClient();
	const issueIdInputId = useId();
	const issueSubjectInputId = useId();

	const [issueId, setIssueId] = useState("");
	const [issueSubject, setIssueSubject] = useState("");
	const [error, setError] = useState("");

	// Fetch custom issues from server
	const { data: customIssues = [], isLoading: isLoadingCustom } = useQuery({
		queryKey: ["customIssues"],
		queryFn: () => getCustomIssuesFn(),
		enabled: open,
	});

	// Fetch API issues to validate against duplicates
	const { data: apiIssues } = useQuery({
		queryKey: ["issues"],
		queryFn: () => getIssues({ data: {} }),
		staleTime: 5 * 60 * 1000,
	});

	// Add custom issue mutation
	const addMutation = useMutation({
		mutationFn: addCustomIssueFn,
		onSuccess: (result) => {
			if (result.success) {
				queryClient.invalidateQueries({ queryKey: ["customIssues"] });
				setIssueId("");
				setIssueSubject("");
				setError("");
			} else {
				setError(result.error || "Failed to add issue");
			}
		},
		onError: (err) => {
			setError(err instanceof Error ? err.message : "Failed to add issue");
		},
	});

	// Delete custom issue mutation
	const deleteMutation = useMutation({
		mutationFn: deleteCustomIssueFn,
		onSuccess: (result) => {
			if (result.success) {
				queryClient.invalidateQueries({ queryKey: ["customIssues"] });
				setError("");
			} else {
				setError(result.error || "Failed to delete issue");
			}
		},
		onError: (err) => {
			setError(err instanceof Error ? err.message : "Failed to delete issue");
		},
	});

	const handleAddIssue = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		// Validate inputs
		const id = Number.parseInt(issueId, 10);
		if (Number.isNaN(id) || id <= 0) {
			setError("Please enter a valid issue ID (positive number)");
			return;
		}

		if (!issueSubject.trim()) {
			setError("Please enter a subject");
			return;
		}

		// Check for duplicates in API issues
		const apiIssueIds = apiIssues?.map((issue) => issue.id) || [];
		if (apiIssueIds.includes(id)) {
			setError("This issue ID already exists in your Redmine issues");
			return;
		}

		// Check for duplicates in custom issues
		if (customIssues.some((ci) => ci.issueId === id)) {
			setError("This issue ID already exists in your custom issues");
			return;
		}

		addMutation.mutate({ data: { issueId: id, subject: issueSubject.trim() } });
	};

	const handleDeleteIssue = (id: string) => {
		deleteMutation.mutate({ data: { id } });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Manage Custom Issues</DialogTitle>
					<DialogDescription>
						Create custom issues that will be available in the time entry
						dialog. These are saved to your account.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Add New Issue Form */}
					<form onSubmit={handleAddIssue} className="space-y-4">
						<div className="grid grid-cols-3 gap-4">
							<div className="col-span-1">
								<Label htmlFor={issueIdInputId}>Issue ID *</Label>
								<Input
									id={issueIdInputId}
									type="number"
									placeholder="e.g., 12345"
									value={issueId}
									onChange={(e) => setIssueId(e.target.value)}
									min="1"
									step="1"
								/>
							</div>
							<div className="col-span-2">
								<Label htmlFor={issueSubjectInputId}>Subject *</Label>
								<Input
									id={issueSubjectInputId}
									type="text"
									placeholder="e.g., Custom task description"
									value={issueSubject}
									onChange={(e) => setIssueSubject(e.target.value)}
								/>
							</div>
						</div>

						{error && (
							<div className="text-sm text-destructive font-medium">
								{error}
							</div>
						)}

						<Button
							type="submit"
							className="w-full"
							disabled={addMutation.isPending}
						>
							{addMutation.isPending ? "Adding..." : "Add Custom Issue"}
						</Button>
					</form>

					{/* List of Custom Issues */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-semibold">
								Custom Issues ({customIssues.length})
							</h3>
							{customIssues.length > 0 && (
								<Badge variant="secondary">Synced to account</Badge>
							)}
						</div>

						{isLoadingCustom ? (
							<div className="text-center py-8 text-muted-foreground text-sm">
								Loading custom issues...
							</div>
						) : customIssues.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground text-sm">
								No custom issues yet. Add one using the form above.
							</div>
						) : (
							<div className="border rounded-md">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-[100px]">ID</TableHead>
											<TableHead>Subject</TableHead>
											<TableHead className="w-[80px] text-right">
												Actions
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{customIssues.map((issue) => (
											<TableRow key={issue.id}>
												<TableCell className="font-mono">
													#{issue.issueId}
												</TableCell>
												<TableCell>{issue.subject}</TableCell>
												<TableCell className="text-right">
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleDeleteIssue(issue.id)}
														disabled={deleteMutation.isPending}
														title="Delete custom issue"
													>
														<Trash2 className="h-4 w-4 text-destructive" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
