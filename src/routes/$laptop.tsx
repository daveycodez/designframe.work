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
	const emptySelections = Object.fromEntries(
		laptop.expansionCardSlots.map(({ slot }) => [slot, ""]),
	) as Record<number, ExpansionCardId | "">;

	const [userBackId, setUserBackId] = useState<string>("");
	const [userExpansionCards, setUserExpansionCards] =
		useState<Record<number, ExpansionCardId | "">>(emptySelections);

	const back = laptop.backs.find((b) => b.id === userBackId) ?? laptop.backs[0];

	const effectiveExpansionCards = Object.fromEntries(
		laptop.expansionCardSlots.map(({ slot }) => [
			slot,
			userExpansionCards[slot] || back.defaultExpansionCardId,
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
					setUserExpansionCards(emptySelections);
				}}
				onSelectBack={setUserBackId}
				onSelectExpansionCard={(slot, id) => {
					setUserExpansionCards((prev) => ({ ...prev, [slot]: id }));
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
