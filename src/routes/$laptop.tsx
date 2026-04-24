import { Button } from "@heroui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { ConfigurationPanel } from "#/components/framework/configuration-panel";
import { ProductViewer } from "#/components/framework/product-viewer";
import type { ExpansionCardId } from "#/data/expansion-cards";
import { getLaptopById, type Laptop } from "#/data/laptops";

export const Route = createFileRoute("/$laptop")({
	component: LaptopPage,
});

function LaptopPage() {
	const { laptop: laptopId } = Route.useParams();
	const laptop = getLaptopById(laptopId);

	if (!laptop) return <LaptopNotFound id={laptopId} />;

	return <LaptopConfigurator laptop={laptop} />;
}

function LaptopConfigurator({ laptop }: { laptop: Laptop }) {
	const [userBackId, setUserBackId] = useState<string>("");
	// A bulk selection applies to every slot (including slots on laptops the
	// user hasn't visited yet) and is superseded per-slot by `slotOverrides`.
	// Tracking these separately keeps a bulk pick sticky when navigating
	// between laptops with different slot counts.
	const [bulkCardId, setBulkCardId] = useState<ExpansionCardId | "">("");
	const [slotOverrides, setSlotOverrides] = useState<
		Record<number, ExpansionCardId>
	>({});

	const back = laptop.backs.find((b) => b.id === userBackId) ?? laptop.backs[0];

	const effectiveExpansionCards = Object.fromEntries(
		laptop.expansionCardSlots.map(({ slot }) => [
			slot,
			slotOverrides[slot] || bulkCardId || back.defaultExpansionCardId,
		]),
	) as Record<number, ExpansionCardId>;

	return (
		<div className="grid h-full grid-cols-1 lg:grid-cols-2">
			<ProductViewer
				back={back}
				expansionCards={effectiveExpansionCards}
				laptop={laptop}
			/>
			<ConfigurationPanel
				laptop={laptop}
				onReset={() => {
					setUserBackId("");
					setBulkCardId("");
					setSlotOverrides({});
				}}
				onSelectAllExpansionCards={(id) => {
					setBulkCardId(id);
					setSlotOverrides({});
				}}
				onSelectBack={setUserBackId}
				onSelectExpansionCard={(slot, id) => {
					setSlotOverrides((prev) => ({ ...prev, [slot]: id }));
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
