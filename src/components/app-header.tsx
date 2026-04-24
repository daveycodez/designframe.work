import { Bars, Gear } from "@gravity-ui/icons";
import { Button, Popover } from "@heroui/react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";

import { ThemeToggle } from "#/components/theme-toggle";
import { LAPTOP_MODELS } from "#/data/laptop-models";

const navPill = "rounded-md px-3 py-1.5 text-sm transition-colors";
const activeClass =
	"text-foreground bg-foreground/5 ring-1 ring-foreground/10 font-medium";
const idleClass = "text-foreground/80 hover:bg-foreground/5";
const disabledClass = "cursor-not-allowed text-foreground/40 select-none";

export function AppHeader() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

	const renderNavItems = (onNavigate?: () => void) =>
		LAPTOP_MODELS.map((model) => {
			const shortName = model.name.replace(/^Framework\s+/, "");
			const isActive = pathname === `/${model.id}`;
			if (model.status !== "live") {
				return (
					<span
						aria-disabled
						className={`${navPill} ${disabledClass}`}
						key={model.id}
						tabIndex={-1}
						title="Available soon"
					>
						{shortName}
					</span>
				);
			}
			if (isActive) {
				return (
					<span
						aria-current="page"
						className={`${navPill} ${activeClass}`}
						key={model.id}
					>
						{shortName}
					</span>
				);
			}
			return (
				<Link
					activeOptions={{ exact: true }}
					className={`${navPill} ${idleClass}`}
					key={model.id}
					onClick={onNavigate}
					params={{ laptop: model.id }}
					to="/$laptop"
				>
					{shortName}
				</Link>
			);
		});

	return (
		<header className="border-b border-foreground/10">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
				<Link
					className="flex items-center gap-1.5 text-base md:text-lg font-semibold tracking-tight text-foreground"
					to="/"
				>
					<Gear className="size-5" />
					<span>design framework</span>
				</Link>

				<nav
					aria-label="Framework laptop model"
					className="hidden items-center gap-1 text-muted sm:flex sm:gap-2"
				>
					{renderNavItems()}
				</nav>

				<div className="flex items-center gap-1">
					<ThemeToggle />
					<div className="sm:hidden">
						<Popover isOpen={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
							<Button aria-label="Open menu" isIconOnly variant="ghost">
								<Bars />
							</Button>
							<Popover.Content className="w-48">
								<Popover.Dialog>
									<nav
										aria-label="Framework laptop model"
										className="flex flex-col gap-1 text-muted"
									>
										{renderNavItems(() => setMobileMenuOpen(false))}
									</nav>
								</Popover.Dialog>
							</Popover.Content>
						</Popover>
					</div>
				</div>
			</div>
		</header>
	);
}
