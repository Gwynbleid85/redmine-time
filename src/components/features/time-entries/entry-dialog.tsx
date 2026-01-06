import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getPredefinedIssues } from "@/lib/api.predefined-issues";
import { getIssues } from "@/lib/api.redmine";
import type { ExtendedIssue } from "@/lib/redmine-types";
import { formatDateForRedmine } from "@/lib/redmine-utils";
import { getCustomIssuesFn } from "@/lib/server/custom-issues";
import type { PlaceholderType, Task, TimePlaceholder } from "@/lib/types";
import { PLACEHOLDER_DEFAULTS } from "@/lib/types";
import { cn, formatDuration, parseDuration } from "@/lib/utils";

// Activity options matching the Redmine setup
const ACTIVITY_OPTIONS = [
	{ id: 9, name: "Vývoj" },
	{ id: 19, name: "Provoz - nepravidelny" },
	{ id: 20, name: "Provoz - pravidelny" },
] as const;

interface TimeEntryFormData {
	issueId: number | null;
	hours: string;
	comments: string;
	spentOn: string; // YYYY-MM-DD
	activityId: number;
}

interface PlaceholderFormData {
	type: PlaceholderType;
	date: string;
	duration: string;
	note: string;
}

type EntryType = "timeEntry" | "placeholder";

interface EntryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedDate?: Date;
	initialTab?: EntryType;
	// Time entry props
	task?: Task | null;
	onSaveTimeEntry: (data: {
		issueId: number;
		hours: number;
		comments: string;
		spentOn: string;
		activityId: number;
	}) => void;
	// Placeholder props
	placeholder?: TimePlaceholder | null;
	onSavePlaceholder: (data: {
		type: PlaceholderType;
		date: string;
		duration: number;
		note?: string;
	}) => void;
}

export function EntryDialog({
	open,
	onOpenChange,
	selectedDate,
	initialTab = "timeEntry",
	task,
	onSaveTimeEntry,
	placeholder,
	onSavePlaceholder,
}: EntryDialogProps) {
	// Determine which tab should be active based on what we're editing
	const getActiveTab = (): EntryType => {
		if (placeholder) return "placeholder";
		if (task) return "timeEntry";
		return initialTab;
	};

	const [activeTab, setActiveTab] = useState<EntryType>(getActiveTab());

	// Update active tab when dialog opens/closes or entries change
	useEffect(() => {
		if (open) {
			setActiveTab(getActiveTab());
		}
	}, [open, task, placeholder, initialTab]);

	// Fetch issues from Redmine for time entry tab
	const { data: apiIssues, isLoading: isLoadingIssues } = useQuery({
		queryKey: ["issues"],
		queryFn: () => getIssues({ data: {} }),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: open && activeTab === "timeEntry",
	});

	const { data: predefinedIssues, isLoading: isLoadingPredefined } = useQuery({
		queryKey: ["predefinedIssues"],
		queryFn: () => getPredefinedIssues(),
		staleTime: Number.POSITIVE_INFINITY,
		enabled: open && activeTab === "timeEntry",
	});

	const { data: customIssues, isLoading: isLoadingCustom } = useQuery({
		queryKey: ["customIssues"],
		queryFn: () => getCustomIssuesFn(),
		staleTime: 60 * 1000,
		enabled: open && activeTab === "timeEntry",
	});

	// Merge API issues with predefined and custom issues
	const allIssues: ExtendedIssue[] = useMemo(() => {
		const apiIssueList: ExtendedIssue[] = apiIssues || [];
		const predefinedIssueList: ExtendedIssue[] =
			predefinedIssues?.map((pi) => ({
				id: pi.id,
				subject: pi.subject,
				isPredefined: true,
			})) || [];
		const customIssueList: ExtendedIssue[] =
			customIssues?.map((ci) => ({
				id: ci.issueId,
				subject: ci.subject,
				isCustom: true,
			})) || [];

		const issueMap = new Map<number, ExtendedIssue>();
		for (const issue of customIssueList) {
			issueMap.set(issue.id, issue);
		}
		for (const issue of predefinedIssueList) {
			issueMap.set(issue.id, issue);
		}
		for (const issue of apiIssueList) {
			issueMap.set(issue.id, issue);
		}

		return Array.from(issueMap.values()).sort((a, b) => a.id - b.id);
	}, [apiIssues, predefinedIssues, customIssues]);

	// Time entry state
	const [timeEntryForm, setTimeEntryForm] = useState<TimeEntryFormData>({
		issueId: null,
		hours: "01:00",
		comments: "",
		spentOn: formatDateForRedmine(selectedDate || new Date()),
		activityId: 9,
	});
	const [issueComboOpen, setIssueComboOpen] = useState(false);
	const [issueSearchQuery, setIssueSearchQuery] = useState("");

	// Placeholder state
	const [placeholderForm, setPlaceholderForm] = useState<PlaceholderFormData>({
		type: "Vacation",
		date: formatDateForRedmine(selectedDate || new Date()),
		duration: formatDuration(PLACEHOLDER_DEFAULTS.Vacation),
		note: "",
	});
	const [placeholderErrors, setPlaceholderErrors] = useState<{
		duration?: string;
		date?: string;
	}>({});

	// Update time entry form when task changes or selectedDate changes
	useEffect(() => {
		if (task) {
			setTimeEntryForm({
				issueId: task.issueId || null,
				hours: formatDuration(task.duration),
				comments: task.title || "",
				spentOn: formatDateForRedmine(task.date),
				activityId: task.activityId || 9,
			});
		} else if (selectedDate) {
			setTimeEntryForm((prev) => ({
				...prev,
				spentOn: formatDateForRedmine(selectedDate),
			}));
		}
	}, [task, selectedDate]);

	// Update placeholder form when placeholder changes or selectedDate changes
	useEffect(() => {
		if (open) {
			if (placeholder) {
				setPlaceholderForm({
					type: placeholder.type,
					date: formatDateForRedmine(placeholder.date),
					duration: formatDuration(placeholder.duration),
					note: placeholder.note || "",
				});
			} else {
				const defaultType: PlaceholderType = "Vacation";
				setPlaceholderForm({
					type: defaultType,
					date: formatDateForRedmine(selectedDate || new Date()),
					duration: formatDuration(PLACEHOLDER_DEFAULTS[defaultType]),
					note: "",
				});
			}
			setPlaceholderErrors({});
		}
	}, [open, placeholder, selectedDate]);

	// Fuzzy filter issues based on search query
	const filteredIssues = useMemo(() => {
		if (!allIssues) return [];
		if (!issueSearchQuery.trim()) return allIssues;

		const query = issueSearchQuery.toLowerCase().trim();
		return allIssues.filter((issue) => {
			const idMatch = issue.id.toString().includes(query.replace("#", ""));
			const subjectMatch = issue.subject.toLowerCase().includes(query);
			return idMatch || subjectMatch;
		});
	}, [allIssues, issueSearchQuery]);

	// Handlers for time entry
	const handleTimeEntrySubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!timeEntryForm.issueId) {
			alert("Please select an issue");
			return;
		}

		const parsedHours = parseDuration(timeEntryForm.hours);
		if (parsedHours === null || parsedHours <= 0) {
			alert("Please enter a valid duration (e.g., 1.5 or 01:30)");
			return;
		}

		onSaveTimeEntry({
			issueId: timeEntryForm.issueId,
			hours: parsedHours,
			comments: timeEntryForm.comments,
			spentOn: timeEntryForm.spentOn,
			activityId: timeEntryForm.activityId,
		});

		onOpenChange(false);

		// Reset form
		setTimeEntryForm({
			issueId: null,
			hours: "01:00",
			comments: "",
			spentOn: formatDateForRedmine(selectedDate || new Date()),
			activityId: 9,
		});
	};

	// Handlers for placeholder
	const handlePlaceholderTypeChange = (newType: PlaceholderType) => {
		setPlaceholderForm((prev) => ({
			...prev,
			type: newType,
			duration: !placeholder
				? formatDuration(PLACEHOLDER_DEFAULTS[newType])
				: prev.duration,
		}));
	};

	const handlePlaceholderSave = () => {
		const newErrors: typeof placeholderErrors = {};

		// Validate date
		if (!placeholderForm.date) {
			newErrors.date = "Date is required";
		}

		// Validate duration
		const parsedDuration = parseDuration(placeholderForm.duration);
		if (parsedDuration === null) {
			newErrors.duration = "Invalid duration format (use HH:MM or decimal)";
		} else if (parsedDuration <= 0) {
			newErrors.duration = "Duration must be greater than 0";
		} else if (parsedDuration > 24) {
			newErrors.duration = "Duration cannot exceed 24 hours";
		}

		if (Object.keys(newErrors).length > 0) {
			setPlaceholderErrors(newErrors);
			return;
		}

		onSavePlaceholder({
			type: placeholderForm.type,
			date: placeholderForm.date,
			duration: parsedDuration as number,
			note: placeholderForm.note.trim() || undefined,
		});

		onOpenChange(false);
	};

	const isEditingTimeEntry = !!task;
	const isEditingPlaceholder = !!placeholder;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>
						{isEditingTimeEntry
							? "Edit Time Entry"
							: isEditingPlaceholder
								? "Edit Time Placeholder"
								: "Add Entry"}
					</DialogTitle>
					<DialogDescription>
						{isEditingTimeEntry
							? "Update the time entry details below."
							: isEditingPlaceholder
								? "Update the details of this time placeholder."
								: "Add a time entry to Redmine or a time placeholder for non-work activities."}
					</DialogDescription>
				</DialogHeader>

				<Tabs
					value={activeTab}
					onValueChange={(v) => setActiveTab(v as EntryType)}
				>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="timeEntry">Time Entry</TabsTrigger>
						<TabsTrigger value="placeholder">Placeholder</TabsTrigger>
					</TabsList>

					{/* Time Entry Tab */}
					<TabsContent value="timeEntry">
						<form onSubmit={handleTimeEntrySubmit}>
							<div className="grid gap-4 py-4">
								{/* Issue Selection */}
								<div className="grid gap-2">
									<Label htmlFor="issueId">Issue *</Label>
									<Popover
										open={issueComboOpen}
										onOpenChange={setIssueComboOpen}
									>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={issueComboOpen}
												className="w-full justify-between"
												disabled={
													isLoadingIssues ||
													isLoadingPredefined ||
													isLoadingCustom
												}
											>
												{timeEntryForm.issueId
													? (() => {
															const selected = allIssues?.find(
																(issue) => issue.id === timeEntryForm.issueId,
															);
															return selected
																? `#${selected.id} - ${selected.subject}`
																: "Select an issue";
														})()
													: "Select an issue"}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-[460px] p-0">
											<Command shouldFilter={false}>
												<CommandInput
													placeholder="Search issues by ID or subject..."
													value={issueSearchQuery}
													onValueChange={setIssueSearchQuery}
												/>
												<CommandList>
													<CommandEmpty>
														{isLoadingIssues ||
														isLoadingPredefined ||
														isLoadingCustom
															? "Loading issues..."
															: "No issues found."}
													</CommandEmpty>
													<CommandGroup>
														{filteredIssues.map((issue) => (
															<CommandItem
																key={issue.id}
																value={issue.id.toString()}
																onSelect={() => {
																	setTimeEntryForm({
																		...timeEntryForm,
																		issueId: issue.id,
																	});
																	setIssueComboOpen(false);
																	setIssueSearchQuery("");
																}}
															>
																<Check
																	className={cn(
																		"mr-2 h-4 w-4",
																		timeEntryForm.issueId === issue.id
																			? "opacity-100"
																			: "opacity-0",
																	)}
																/>
																<span className="flex-1">
																	#{issue.id} - {issue.subject}
																</span>
																{issue.isPredefined && (
																	<Badge variant="secondary" className="ml-2">
																		Default
																	</Badge>
																)}
																{issue.isCustom && (
																	<Badge variant="secondary" className="ml-2">
																		Custom
																	</Badge>
																)}
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								</div>

								{/* Hours */}
								<div className="grid gap-2">
									<Label htmlFor="hours">Duration *</Label>
									<Input
										type="text"
										placeholder="01:30 or 1.5"
										value={timeEntryForm.hours}
										onChange={(e) =>
											setTimeEntryForm({
												...timeEntryForm,
												hours: e.target.value,
											})
										}
										required
									/>
									<p className="text-xs text-muted-foreground">
										Enter as HH:MM (e.g., 01:30) or decimal (e.g., 1.5)
									</p>
								</div>

								{/* Comments */}
								<div className="grid gap-2">
									<Label htmlFor="comments">Comments</Label>
									<Textarea
										value={timeEntryForm.comments}
										onChange={(e) =>
											setTimeEntryForm({
												...timeEntryForm,
												comments: e.target.value,
											})
										}
										placeholder="What did you work on?"
										rows={3}
									/>
								</div>

								{/* Date */}
								<div className="grid gap-2">
									<Label htmlFor="spentOn">Date *</Label>
									<Input
										type="date"
										value={timeEntryForm.spentOn}
										onChange={(e) =>
											setTimeEntryForm({
												...timeEntryForm,
												spentOn: e.target.value,
											})
										}
										required
									/>
								</div>

								{/* Activity */}
								<div className="grid gap-2">
									<Label htmlFor="activityId">Activity *</Label>
									<Select
										value={timeEntryForm.activityId.toString()}
										onValueChange={(value) =>
											setTimeEntryForm({
												...timeEntryForm,
												activityId: Number.parseInt(value, 10),
											})
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{ACTIVITY_OPTIONS.map((activity) => (
												<SelectItem
													key={activity.id}
													value={activity.id.toString()}
												>
													{activity.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => onOpenChange(false)}
								>
									Cancel
								</Button>
								<Button type="submit">
									{task ? "Update Time Entry" : "Create Time Entry"}
								</Button>
							</DialogFooter>
						</form>
					</TabsContent>

					{/* Placeholder Tab */}
					<TabsContent value="placeholder">
						<div className="space-y-4 py-4">
							{/* Type Selection */}
							<div className="space-y-2">
								<Label htmlFor="type">Type</Label>
								<Select
									value={placeholderForm.type}
									onValueChange={handlePlaceholderTypeChange}
								>
									<SelectTrigger id="type">
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Doctor">Doctor</SelectItem>
										<SelectItem value="Vacation">Vacation</SelectItem>
										<SelectItem value="Holiday">Holiday</SelectItem>
										<SelectItem value="Sickday">Sickday</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Date Selection */}
							<div className="space-y-2">
								<Label htmlFor="placeholder-date">Date</Label>
								<Input
									id="placeholder-date"
									type="date"
									value={placeholderForm.date}
									onChange={(e) => {
										setPlaceholderForm({
											...placeholderForm,
											date: e.target.value,
										});
										setPlaceholderErrors((prev) => ({
											...prev,
											date: undefined,
										}));
									}}
									className={placeholderErrors.date ? "border-destructive" : ""}
								/>
								{placeholderErrors.date && (
									<p className="text-sm text-destructive">
										{placeholderErrors.date}
									</p>
								)}
							</div>

							{/* Duration Input */}
							<div className="space-y-2">
								<Label htmlFor="placeholder-duration">
									Duration{" "}
									<span className="text-xs text-muted-foreground">
										(HH:MM or decimal hours)
									</span>
								</Label>
								<Input
									id="placeholder-duration"
									type="text"
									value={placeholderForm.duration}
									onChange={(e) => {
										setPlaceholderForm({
											...placeholderForm,
											duration: e.target.value,
										});
										setPlaceholderErrors((prev) => ({
											...prev,
											duration: undefined,
										}));
									}}
									placeholder="08:00 or 8.0"
									className={
										placeholderErrors.duration ? "border-destructive" : ""
									}
								/>
								{placeholderErrors.duration && (
									<p className="text-sm text-destructive">
										{placeholderErrors.duration}
									</p>
								)}
								<p className="text-xs text-muted-foreground">
									Default:{" "}
									{formatDuration(PLACEHOLDER_DEFAULTS[placeholderForm.type])}
								</p>
							</div>

							{/* Note (Optional) */}
							<div className="space-y-2">
								<Label htmlFor="placeholder-note">
									Note{" "}
									<span className="text-xs text-muted-foreground">
										(optional)
									</span>
								</Label>
								<Textarea
									id="placeholder-note"
									value={placeholderForm.note}
									onChange={(e) =>
										setPlaceholderForm({
											...placeholderForm,
											note: e.target.value,
										})
									}
									placeholder="Add any additional details..."
									rows={3}
								/>
							</div>
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button onClick={handlePlaceholderSave}>
								{placeholder ? "Update" : "Add"} Placeholder
							</Button>
						</DialogFooter>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
