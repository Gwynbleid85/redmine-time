import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { ChangelogWrapper } from "@/components/features/changelog";
import { Footer } from "@/components/layout";
import { ThemeProvider } from "@/components/theme-provider";
import { checkAuth } from "@/lib/auth-utils";
import { themeScript } from "@/lib/theme";
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
			auth: { isAuthenticated },
		};
	},
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Redmine Time" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	component: RootComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	const { auth } = Route.useRouteContext();

	return (
		<ThemeProvider>
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
			<TanStackDevtools />
		</ThemeProvider>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
				<link rel="icon" href="/logo.svg" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
				/>
				{/* Inline script to prevent flash of wrong theme - standard pattern used by next-themes */}
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
