import { ChangelogVersionLink } from "@/components/features/changelog";

interface FooterProps {
	isAuthenticated: boolean;
	onVersionClick: () => void;
}

export function Footer({ isAuthenticated, onVersionClick }: FooterProps) {
	return (
		<footer className="bg-muted text-muted-foreground py-3 px-4 text-center text-sm border-t">
			<div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4">
				<span>&copy; {new Date().getFullYear()} Redmine Time</span>
				<span className="hidden sm:inline">|</span>
				<span>
					<a
						href="https://github.com/Gwynbleid85"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:underline"
					>
						Gwynbleid85
					</a>
					{" & "}
					<a
						href="https://github.com/MartinBspheroid"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:underline"
					>
						MartinBspheroid
					</a>
				</span>
				{isAuthenticated && (
					<>
						<span className="hidden sm:inline">|</span>
						<ChangelogVersionLink onClick={onVersionClick} />
					</>
				)}
			</div>
		</footer>
	);
}
