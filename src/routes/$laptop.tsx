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
 * - `color` — selected back-finish id (e.g. `"sage"`).
 * - `expansion-cards` — comma-separated per-slot card ids, positionally
 *   indexed by the laptop's `expansionCardSlots` order. Empty entries fall
 *   back to the back's default card; trailing empties are elided to keep
 *   URLs tidy. A "bulk" selection is just every slot carrying the same
 *   value — we don't store the bulk choice separately.
 */
type LaptopSearch = {
	color?: string;
	"expansion-cards"?: string;
};

export const Route = createFileRoute("/$laptop")({
	component: LaptopPage,
	validateSearch: (search: Record<string, unknown>): LaptopSearch => {
		const out: LaptopSearch = {};
		const color = search.color;
		if (typeof color === "string" && color) out.color = color;
		const cards = search["expansion-cards"];
		if (typeof cards === "string" && cards) out["expansion-cards"] = cards;
		return out;
	},
});

function LaptopPage() {
	const { laptop: laptopId } = Route.useParams();
	const laptop = getLaptopById(laptopId);

	if (!laptop) return <LaptopNotFound id={laptopId} />;

	return <LaptopConfigurator laptop={laptop} />;
}

function decodeExpansionCards(
	param: string | undefined,
	laptop: Laptop,
): Record<number, ExpansionCardId> {
	if (!param) return {};
	const parts = param.split(",");
	const result: Record<number, ExpansionCardId> = {};
	laptop.expansionCardSlots.forEach(({ slot }, idx) => {
		const value = parts[idx];
		if (value) result[slot] = value;
	});
	return result;
}

function encodeExpansionCards(
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
		laptop.backs.find((b) => b.id === search.color) ?? laptop.backs[0];
	const slotOverrides = decodeExpansionCards(search["expansion-cards"], laptop);

	const effectiveExpansionCards = Object.fromEntries(
		laptop.expansionCardSlots.map(({ slot }) => [
			slot,
			slotOverrides[slot] || back.defaultExpansionCardId,
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
					const filled: Record<number, ExpansionCardId> = {};
					laptop.expansionCardSlots.forEach(({ slot }) => {
						filled[slot] = id;
					});
					const encoded = encodeExpansionCards(filled, laptop);
					navigate({
						search: (prev) => {
							const next: LaptopSearch = {};
							if (prev.color) next.color = prev.color;
							if (encoded) next["expansion-cards"] = encoded;
							return next;
						},
						replace: true,
						resetScroll: false,
					});
				}}
				onSelectBack={(id) => {
					navigate({
						search: (prev) => ({ ...prev, color: id }),
						replace: true,
						resetScroll: false,
					});
				}}
				onSelectExpansionCard={(slot, id) => {
					navigate({
						search: (prev) => {
							const current = decodeExpansionCards(
								prev["expansion-cards"],
								laptop,
							);
							const nextOverrides = { ...current, [slot]: id };
							const encoded = encodeExpansionCards(nextOverrides, laptop);
							const next: LaptopSearch = {};
							if (prev.color) next.color = prev.color;
							if (encoded) next["expansion-cards"] = encoded;
							return next;
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
