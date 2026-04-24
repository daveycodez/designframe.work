import { Bars, Gear } from "@gravity-ui/icons";
import { Button, Popover } from "@heroui/react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";

import { ThemeToggle } from "#/components/theme-toggle";
import { LAPTOP_MODELS } from "#/data/laptop-models";
import { getLaptopById } from "#/data/laptops";

const navPill = "rounded-md px-3 py-1.5 text-sm transition-colors";
const activeClass =
	"text-foreground bg-foreground/5 ring-1 ring-foreground/10 font-medium";
const idleClass = "text-foreground/80 hover:bg-foreground/5";
const disabledClass = "cursor-not-allowed text-foreground/40 select-none";

/**
 * Reshape the current `?expansion-cards=` string so it lands naturally on a
 * target laptop with a different slot count.
 *
 * - Target has fewer slots → trim to the first N entries (and strip
 *   trailing empties). This is the laptop-16 → laptop-12/13/13-pro case
 *   where we only carry the first 4 cards.
 * - Target has more slots → if every supplied entry is the same non-empty
 *   card id, broadcast it across every target slot so a "bulk" selection
 *   stays bulk (e.g. 4 reds → 6 reds when navigating to laptop-16).
 *   Otherwise pass the existing entries through and let the extra slots
 *   fall back to the back's default.
 * - Target has the same slot count → pass through unchanged.
 */
function projectExpansionCardsForTarget(
	current: string | undefined,
	targetSlotCount: number,
): string | undefined {
	if (!current || targetSlotCount === 0) return undefined;
	const parts = current.split(",");
	if (targetSlotCount < parts.length) {
		const trimmed = parts.slice(0, targetSlotCount);
		while (trimmed.length > 0 && trimmed[trimmed.length - 1] === "")
			trimmed.pop();
		return trimmed.length > 0 ? trimmed.join(",") : undefined;
	}
	if (targetSlotCount > parts.length) {
		const first = parts[0];
		const allMatch = Boolean(first) && parts.every((p) => p === first);
		if (allMatch) {
			return new Array<string>(targetSlotCount).fill(first as string).join(",");
		}
	}
	return current;
}

export function AppHeader() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const currentExpansionCards = useRouterState({
		select: (s) => {
			const value = (s.location.search as Record<string, unknown>)[
				"expansion-cards"
			];
			return typeof value === "string" ? value : undefined;
		},
	});
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
			const targetSlotCount =
				getLaptopById(model.id)?.expansionCardSlots.length ?? 0;
			const projectedCards = projectExpansionCardsForTarget(
				currentExpansionCards,
				targetSlotCount,
			);
			return (
				<Link
					activeOptions={{ exact: true }}
					className={`${navPill} ${idleClass}`}
					key={model.id}
					onClick={onNavigate}
					params={{ laptop: model.id }}
					search={projectedCards ? { "expansion-cards": projectedCards } : {}}
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
					<Gear className="size-5 text-accent" />
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
