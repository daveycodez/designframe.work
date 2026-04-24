/**
 * Laptop-model data.
 *
 * Every dimension needed to render and configure a laptop lives in the
 * per-model JSON in `./laptops/`. Because back-panel photos are often
 * shot in different studios at different sizes, image dimensions and the
 * view-crop rectangle live on each back finish — not at the laptop level.
 * Slot positions stay at the laptop level but are expressed in normalized
 * 0–1 coordinates of the view rectangle, so they line up across any
 * finish's photo regardless of its raw pixel size.
 */
import type { ExpansionCardId } from "#/data/expansion-cards";
import laptop12 from "./laptops/laptop-12.json";
import laptop13 from "./laptops/laptop-13.json";
import laptop13Pro from "./laptops/laptop-13-pro.json";
import laptop16 from "./laptops/laptop-16.json";

/** A rectangle in pixel coordinates of a back-finish photo. */
export type LaptopRect = {
	x: number;
	y: number;
	width: number;
	height: number;
};

/**
 * Placement of an expansion-card overlay on a laptop.
 *
 * All values are pixels in the laptop image's own coordinate system (same
 * space as `LaptopBack.image` and `view`).
 *
 * - `x`, `y` - top-left of the card's **visual** (post-rotation) bounding
 *   box, so eyedropping from the image gives you the right number no matter
 *   the rotation.
 * - `rotate` - clockwise degrees around the card's center. +90 = USB-C
 *   points right, -90 = points left, 0 = points up.
 *
 * The card's rendered pre-rotation size comes from `Laptop.expansionCardSize`
 * (optionally modulated per-slot by `ExpansionCardSlot.scale`). For ±90°
 * rotations the visual bbox is `expansionCardSize.height × .width` (swapped).
 *
 * Placements live at the laptop level so they're reused across every back
 * finish of that laptop. This assumes all back photos of a given laptop
 * have the laptop body positioned at consistent pixel coordinates.
 */
export type ExpansionCardPlacement = {
	x: number;
	y: number;
	rotate?: number;
};

/**
 * Per-axis scale for an expansion-card placement. `x` scales the card's
 * **visual** horizontal extent, `y` its visual vertical extent — regardless
 * of rotation, so e.g. `x: 0.5` always shrinks the card left-to-right on
 * screen. Defaults to 1 on either axis when omitted.
 */
export type ExpansionCardScale = {
	x: number;
	y: number;
};

export type ExpansionCardSlot = {
	slot: number;
	/**
	 * When present the card selected for this slot is rendered on top of the
	 * laptop photo. When omitted the slot still appears in the configurator
	 * panel but is not drawn yet (useful for dialing in placements one slot
	 * at a time).
	 */
	position?: ExpansionCardPlacement;
	/**
	 * Optional per-slot scale. Useful when cards in different slots want to
	 * render at different sizes (e.g. top vs bottom row).
	 */
	scale?: ExpansionCardScale;
};

export type LaptopBack = {
	id: string;
	label: string;
	shell: string;
	accent: string;
	defaultExpansionCardId: ExpansionCardId;
	/** The back-panel photo and its native pixel dimensions. */
	image: {
		src: string;
		width: number;
		height: number;
	};
	/**
	 * Sub-rectangle of the photo (in its own pixel coords) that tightly
	 * frames the laptop body. Drives the SVG viewBox and the normalized
	 * slot-position coordinate space.
	 */
	view: LaptopRect;
};

export type LaptopId =
	| "laptop-12"
	| "laptop-13"
	| "laptop-13-pro"
	| "laptop-16";

export type Laptop = {
	id: LaptopId;
	name: string;
	/**
	 * Baseline pre-rotation size an expansion card renders at on this
	 * laptop, in laptop-image pixels. Each slot's optional `scale` then
	 * modulates this per-slot.
	 */
	expansionCardSize: {
		width: number;
		height: number;
	};
	expansionCardSlots: ReadonlyArray<ExpansionCardSlot>;
	backs: ReadonlyArray<LaptopBack>;
};

export const LAPTOPS: ReadonlyArray<Laptop> = [
	laptop12 as Laptop,
	laptop13Pro as Laptop,
	laptop13 as Laptop,
	laptop16 as Laptop,
];

export function getLaptopById(id: string): Laptop | undefined {
	return LAPTOPS.find((l) => l.id === id);
}
