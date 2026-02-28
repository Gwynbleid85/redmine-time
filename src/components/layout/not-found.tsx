import { Link } from "@tanstack/react-router";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Custom 404 Not Found page
 * Displayed when users navigate to a route that doesn't exist
 */
export function NotFound() {
	return (
		<div className="min-h-[60vh] flex items-center justify-center px-4">
			<div className="text-center space-y-6 max-w-md">
				{/* Icon */}
				<div className="flex justify-center">
					<div className="rounded-full bg-muted p-6">
						<FileQuestion className="h-16 w-16 text-muted-foreground" />
					</div>
				</div>

				{/* Heading */}
				<div className="space-y-2">
					<h1 className="text-4xl font-bold tracking-tight">404</h1>
					<h2 className="text-2xl font-semibold">Page Not Found</h2>
				</div>

				{/* Message */}
				<p className="text-muted-foreground">
					The page you're looking for doesn't exist or has been moved.
				</p>

				{/* Action Button */}
				<div className="pt-2">
					<Button asChild>
						<Link to="/">
							<Home className="mr-2 h-4 w-4" />
							Back to Home
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
