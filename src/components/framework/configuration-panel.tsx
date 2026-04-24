import {
	ArrowDownToLine,
	ArrowRotateLeft,
	ArrowUpFromSquare,
	Check,
	CheckShape,
	Copy,
	CopyCheck,
	Dice3,
} from "@gravity-ui/icons";
import {
	Button,
	Dropdown,
	Label,
	Spinner,
	ToggleButtonGroup,
} from "@heroui/react";
import { useRef, useState } from "react";
import { OptionCard, OptionSwatch } from "#/components/framework/option-card";
import { ScrollToTop } from "#/components/framework/scroll-to-top";
import { ConfigurationSection } from "#/components/framework/section-header";
import { EXPANSION_CARDS, type ExpansionCardId } from "#/data/expansion-cards";
import type { Laptop } from "#/data/laptops";
import { canCopyImageToClipboard } from "#/lib/export-png";

function shuffle<T>(items: ReadonlyArray<T>): T[] {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
	}
	return copy;
}

type ConfigurationPanelProps = {
	laptop: Laptop;
	selectedBackId: string;
	onSelectBack: (id: string) => void;
	selectedExpansionCards: Record<number, ExpansionCardId>;
	onSelectExpansionCard: (slot: number, id: ExpansionCardId) => void;
	onSelectAllExpansionCards: (id: ExpansionCardId) => void;
	onReset?: () => void;
	onDownload?: () => void | Promise<void>;
	onCopy?: () => void | Promise<void>;
};

export function ConfigurationPanel({
	laptop,
	selectedBackId,
	onSelectBack,
	selectedExpansionCards,
	onSelectExpansionCard,
	onSelectAllExpansionCards,
	onReset,
	onDownload,
	onCopy,
}: ConfigurationPanelProps) {
	const [isExporting, setIsExporting] = useState(false);
	const [didJustCopy, setDidJustCopy] = useState(false);
	const canCopy = canCopyImageToClipboard();
	const hasExport = Boolean(onDownload) || (Boolean(onCopy) && canCopy);
	const scrollRef = useRef<HTMLElement>(null);
	const selectedBack = laptop.backs.find((b) => b.id === selectedBackId);

	const firstSlotCardId =
		selectedExpansionCards[laptop.expansionCardSlots[0]?.slot];
	const allSlotsMatch = Boolean(
		firstSlotCardId &&
			laptop.expansionCardSlots.every(
				({ slot }) => selectedExpansionCards[slot] === firstSlotCardId,
			),
	);
	const bulkSelectedCard = allSlotsMatch
		? EXPANSION_CARDS.find((c) => c.id === firstSlotCardId)
		: undefined;

	return (
		<aside
			className="flex h-full w-full flex-col overflow-y-auto bg-background"
			ref={scrollRef}
		>
			<div className="px-6 pt-6 pb-2 sm:px-8">
				<div className="flex items-center justify-between gap-4">
					<h2 className="sr-only text-2xl font-semibold tracking-tight text-foreground sm:not-sr-only">
						Preview
					</h2>
					<div className="flex items-center gap-2">
						<Button
							onPress={() => {
								const randomBack =
									laptop.backs[Math.floor(Math.random() * laptop.backs.length)];
								if (randomBack) onSelectBack(randomBack.id);
								const matchingCardId = randomBack?.defaultExpansionCardId;
								const available = matchingCardId
									? EXPANSION_CARDS.filter((c) => c.id !== matchingCardId)
									: EXPANSION_CARDS;
								const shuffled = shuffle(available);
								laptop.expansionCardSlots.forEach(({ slot }, index) => {
									const randomCard = shuffled[index % shuffled.length];
									if (randomCard) onSelectExpansionCard(slot, randomCard.id);
								});
							}}
							size="sm"
							variant="ghost"
						>
							<Dice3 />
							Randomize
						</Button>
						<Button onPress={onReset} size="sm" variant="ghost">
							<ArrowRotateLeft />
							Start Over
						</Button>
						{hasExport ? (
							<Dropdown>
								<Button isDisabled={isExporting} size="sm" variant="ghost">
									{isExporting ? (
										<Spinner size="sm" color="current" />
									) : didJustCopy ? (
										<CopyCheck />
									) : (
										<ArrowUpFromSquare />
									)}
									{didJustCopy ? "Copied!" : "Export"}
								</Button>
								<Dropdown.Popover className="min-w-[180px]">
									<Dropdown.Menu
										onAction={async (key) => {
											const run =
												key === "copy"
													? onCopy
													: key === "download"
														? onDownload
														: undefined;
											if (!run) return;
											setIsExporting(true);
											try {
												await run();
												if (key === "copy") {
													setDidJustCopy(true);
													window.setTimeout(() => setDidJustCopy(false), 1500);
												}
											} catch (err) {
												console.error("Export failed", err);
											} finally {
												setIsExporting(false);
											}
										}}
									>
										{onCopy && canCopy ? (
											<Dropdown.Item id="copy" textValue="Copy to clipboard">
												<Copy className="size-4 shrink-0 text-muted" />
												<Label>Copy Image</Label>
											</Dropdown.Item>
										) : null}
										{onDownload ? (
											<Dropdown.Item id="download" textValue="Download PNG">
												<ArrowDownToLine className="size-4 shrink-0 text-muted" />
												<Label>Download PNG</Label>
											</Dropdown.Item>
										) : null}
									</Dropdown.Menu>
								</Dropdown.Popover>
							</Dropdown>
						) : null}
					</div>
				</div>
			</div>

			<div className="px-6 sm:px-8">
				<ConfigurationSection
					completed
					defaultExpanded
					title="Color"
					value={selectedBack?.label}
				>
					<ToggleButtonGroup
						aria-label="Back panel finish"
						className="grid auto-rows-fr grid-cols-[repeat(3,96px)] gap-2 sm:grid-cols-[repeat(5,96px)] lg:grid-cols-[repeat(4,96px)] xl:grid-cols-[repeat(5,96px)]"
						disallowEmptySelection
						isDetached
						selectedKeys={new Set([selectedBackId])}
						selectionMode="single"
						onSelectionChange={(keys) => {
							const next = [...keys][0] as string | undefined;
							if (next) onSelectBack(next);
						}}
					>
						{laptop.backs.map((back) => (
							<OptionCard
								id={back.id}
								key={back.id}
								label={back.label}
								outline={back.accent}
								swatch={
									<OptionSwatch
										style={{
											background: `linear-gradient(135deg, ${back.shell} 0 50%, ${back.accent} 50% 100%)`,
										}}
									/>
								}
							/>
						))}
					</ToggleButtonGroup>
				</ConfigurationSection>

				<ConfigurationSection
					completed={allSlotsMatch}
					defaultExpanded
					title="Expansion Cards"
					value={bulkSelectedCard?.label}
				>
					<ToggleButtonGroup
						aria-label="All expansion cards finish"
						className="grid auto-rows-fr grid-cols-[repeat(3,96px)] gap-2 sm:grid-cols-[repeat(5,96px)] lg:grid-cols-[repeat(4,96px)] xl:grid-cols-[repeat(5,96px)]"
						isDetached
						selectedKeys={
							allSlotsMatch && firstSlotCardId
								? new Set([firstSlotCardId])
								: new Set()
						}
						selectionMode="single"
						onSelectionChange={(keys) => {
							const next = [...keys][0] as ExpansionCardId | undefined;
							if (next) onSelectAllExpansionCards(next);
						}}
					>
						{EXPANSION_CARDS.map((card) => (
							<OptionCard
								id={card.id}
								key={card.id}
								label={card.label}
								outline={card.outline}
								swatch={
									<OptionSwatch style={{ backgroundColor: card.color }} />
								}
							/>
						))}
					</ToggleButtonGroup>
				</ConfigurationSection>

				{laptop.expansionCardSlots.map(({ slot }) => {
					const selectedId = selectedExpansionCards[slot];
					const selectedCard = EXPANSION_CARDS.find((c) => c.id === selectedId);
					return (
						<ConfigurationSection
							completed={Boolean(selectedCard)}
							defaultExpanded
							key={`expansion-card-${slot}`}
							title={`Expansion Card ${slot}`}
							value={selectedCard?.label}
						>
							<ToggleButtonGroup
								aria-label={`Expansion card ${slot} finish`}
								className="grid auto-rows-fr grid-cols-[repeat(3,96px)] gap-2 sm:grid-cols-[repeat(5,96px)] lg:grid-cols-[repeat(4,96px)] xl:grid-cols-[repeat(5,96px)]"
								disallowEmptySelection
								isDetached
								selectedKeys={selectedId ? new Set([selectedId]) : new Set()}
								selectionMode="single"
								onSelectionChange={(keys) => {
									const next = [...keys][0] as ExpansionCardId | undefined;
									if (next) onSelectExpansionCard(slot, next);
								}}
							>
								{EXPANSION_CARDS.map((card) => (
									<OptionCard
										id={card.id}
										key={card.id}
										label={card.label}
										outline={card.outline}
										swatch={
											<OptionSwatch style={{ backgroundColor: card.color }} />
										}
									/>
								))}
							</ToggleButtonGroup>
						</ConfigurationSection>
					);
				})}
			</div>

			<div className="h-8" />
			<ScrollToTop containerRef={scrollRef} />
		</aside>
	);
}
