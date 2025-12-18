import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { checkAuth } from "@/lib/auth-utils";
import { ChangelogWrapper } from "@/components/features/changelog";
import { Footer } from "@/components/layout";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
	auth: {
		isAuthenticated: boolean;
	};
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async () => {
		const isAuthenticated = await checkAuth();
		return {
			auth: {
				isAuthenticated,
			},
		};
	},
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Redmine Time",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	component: RootComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	const { auth } = Route.useRouteContext();

	return (
		<ChangelogWrapper isAuthenticated={auth.isAuthenticated}>
			{(openHistory) => (
				<div className="min-h-dvh flex flex-col">
					<main className="flex-1">
						<Outlet />
					</main>
					<Footer
						isAuthenticated={auth.isAuthenticated}
						onVersionClick={openHistory}
					/>
				</div>
			)}
		</ChangelogWrapper>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
				{/* favicon */}
				<link rel="icon" href="/logo.svg" />
				<style>
					@import
					url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap');
				</style>
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
