/**
 * Framework expansion-card finish catalogue.
 *
 * The same set of cards is shared across every laptop model — each laptop
 * merely has a different number of card slots and slot placements. Source of
 * truth is `expansion-cards.json`.
 */
import rawCards from "./expansion-cards.json";

/**
 * Sub-rectangle of the card photo that frames the visible card (plus any
 * desired padding). Coordinates are pixels in the source image — matching
 * the `view` rectangle used on laptop backs.
 */
export type ExpansionCardCrop = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export type ExpansionCard = {
	id: string;
	label: string;
	color: string;
	outline: string;
	image?: {
		src: string;
		width: number;
		height: number;
	};
	imageCrop?: ExpansionCardCrop;
};

export type ExpansionCardId = string;

export const EXPANSION_CARDS: ReadonlyArray<ExpansionCard> =
	rawCards as ReadonlyArray<ExpansionCard>;

export function getExpansionCardById(
	id: ExpansionCardId,
): ExpansionCard | undefined {
	return EXPANSION_CARDS.find((c) => c.id === id);
}
