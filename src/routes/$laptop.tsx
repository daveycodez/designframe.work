import { Button } from "@heroui/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";

import { ConfigurationPanel } from "#/components/framework/configuration-panel";
import { ProductViewer } from "#/components/framework/product-viewer";
import type { ExpansionCardId } from "#/data/expansion-cards";
import { getLaptopById, type Laptop } from "#/data/laptops";
import { copySvgAsPng, downloadSvgAsPng } from "#/lib/export-png";

/**
 * Shape of the `/$laptop` search params. All are optional so a bare URL
 * like `/laptop-12` still renders a sensible default configuration.
 *
 * - `back` — selected back-finish id (e.g. `"sage"`).
 * - `cards` — "apply to all" expansion-card id; acts as a fallback for any
 *   slot without its own override.
 * - `slots` — comma-separated per-slot overrides, positionally indexed by
 *   the laptop's `expansionCardSlots` order. Empty entries fall through to
 *   `cards` and then to the back's default card. Trailing empty entries
 *   are elided to keep URLs tidy.
 */
type LaptopSearch = {
	back?: string;
	cards?: string;
	slots?: string;
};

export const Route = createFileRoute("/$laptop")({
	component: LaptopPage,
	validateSearch: (search: Record<string, unknown>): LaptopSearch => {
		const pickString = (key: string) =>
			typeof search[key] === "string" && search[key] ? search[key] : undefined;
		const out: LaptopSearch = {};
		const back = pickString("back");
		const cards = pickString("cards");
		const slots = pickString("slots");
		if (back) out.back = back;
		if (cards) out.cards = cards;
		if (slots) out.slots = slots;
		return out;
	},
});

function LaptopPage() {
	const { laptop: laptopId } = Route.useParams();
	const laptop = getLaptopById(laptopId);

	if (!laptop) return <LaptopNotFound id={laptopId} />;

	return <LaptopConfigurator laptop={laptop} />;
}

function decodeSlotOverrides(
	slotsParam: string | undefined,
	laptop: Laptop,
): Record<number, ExpansionCardId> {
	if (!slotsParam) return {};
	const parts = slotsParam.split(",");
	const result: Record<number, ExpansionCardId> = {};
	laptop.expansionCardSlots.forEach(({ slot }, idx) => {
		const value = parts[idx];
		if (value) result[slot] = value;
	});
	return result;
}

function encodeSlotOverrides(
	overrides: Record<number, ExpansionCardId>,
	laptop: Laptop,
): string | undefined {
	const parts = laptop.expansionCardSlots.map(
		({ slot }) => overrides[slot] ?? "",
	);
	while (parts.length > 0 && parts[parts.length - 1] === "") parts.pop();
	const joined = parts.join(",");
	return joined || undefined;
}

function LaptopConfigurator({ laptop }: { laptop: Laptop }) {
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const svgRef = useRef<SVGSVGElement>(null);

	const back =
		laptop.backs.find((b) => b.id === search.back) ?? laptop.backs[0];
	const bulkCardId = (search.cards ?? "") as ExpansionCardId | "";
	const slotOverrides = decodeSlotOverrides(search.slots, laptop);

	const effectiveExpansionCards = Object.fromEntries(
		laptop.expansionCardSlots.map(({ slot }) => [
			slot,
			slotOverrides[slot] || bulkCardId || back.defaultExpansionCardId,
		]),
	) as Record<number, ExpansionCardId>;

	const handleDownload = async () => {
		const svg = svgRef.current;
		if (!svg) return;
		const slug = laptop.name.toLowerCase().replace(/\s+/g, "-");
		await downloadSvgAsPng(svg, `${slug}-${back.id}.png`);
	};

	const handleCopy = async () => {
		const svg = svgRef.current;
		if (!svg) return;
		await copySvgAsPng(svg);
	};

	const handleCopyUrl = async () => {
		if (typeof window === "undefined") return;
		await navigator.clipboard.writeText(window.location.href);
	};

	return (
		<div className="grid h-full grid-cols-1 lg:grid-cols-2">
			<ProductViewer
				back={back}
				expansionCards={effectiveExpansionCards}
				laptop={laptop}
				svgRef={svgRef}
			/>
			<ConfigurationPanel
				laptop={laptop}
				onCopy={handleCopy}
				onCopyUrl={handleCopyUrl}
				onDownload={handleDownload}
				onReset={() => {
					navigate({ search: {}, replace: true, resetScroll: false });
				}}
				onSelectAllExpansionCards={(id) => {
					navigate({
						search: (prev) => {
							const next: LaptopSearch = { cards: id };
							if (prev.back) next.back = prev.back;
							return next;
						},
						replace: true,
						resetScroll: false,
					});
				}}
				onSelectBack={(id) => {
					navigate({
						search: (prev) => ({ ...prev, back: id }),
						replace: true,
						resetScroll: false,
					});
				}}
				onSelectExpansionCard={(slot, id) => {
					navigate({
						search: (prev) => {
							const current = decodeSlotOverrides(prev.slots, laptop);
							const nextOverrides = { ...current, [slot]: id };
							return {
								...prev,
								slots: encodeSlotOverrides(nextOverrides, laptop),
							};
						},
						replace: true,
						resetScroll: false,
					});
				}}
				selectedBackId={back.id}
				selectedExpansionCards={effectiveExpansionCards}
			/>
		</div>
	);
}

function LaptopNotFound({ id }: { id: string }) {
	return (
		<div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
			<div className="space-y-2">
				<p className="text-2xl font-semibold tracking-tight text-foreground">
					We can't find "{id}".
				</p>
				<p className="text-muted">
					Pick a laptop model from the nav or head home.
				</p>
			</div>
			<Button>
				<Link to="/">Back to home</Link>
			</Button>
		</div>
	);
}
