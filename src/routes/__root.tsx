import { RouterProvider } from "@heroui/react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	type NavigateOptions,
	Scripts,
	type ToOptions,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { AppHeader } from "#/components/app-header";
import appCss from "../styles.css?url";

declare module "react-aria-components" {
	interface RouterConfig {
		href: string;
		routerOptions: Omit<NavigateOptions, keyof ToOptions>;
	}
}

export const Route = createRootRoute({
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
				title: "Design Framework",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();

	return (
		<html lang="en" suppressHydrationWarning className="dark">
			<head>
				<HeadContent />
			</head>
			<body className="flex min-h-screen flex-col bg-background text-foreground lg:h-dvh lg:min-h-0">
				<RouterProvider
					navigate={(to, options) => navigate({ to, ...options })}
				>
					<AppHeader />
					<main className="flex-1 lg:min-h-0">{children}</main>
				</RouterProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
