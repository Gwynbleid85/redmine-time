import { ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomIssuesButtonProps {
	onClick: () => void;
}

export function CustomIssuesButton({ onClick }: CustomIssuesButtonProps) {
	return (
		<Button variant="outline" onClick={onClick}>
			<ListPlus className="mr-2 h-4 w-4" />
			Custom Issues
		</Button>
	);
}
