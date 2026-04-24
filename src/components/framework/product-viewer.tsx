import { type Ref, useEffect, useState } from "react";
import {
	type ExpansionCard,
	type ExpansionCardId,
	getExpansionCardById,
} from "#/data/expansion-cards";
import type {
	ExpansionCardPlacement,
	Laptop,
	LaptopBack,
} from "#/data/laptops";

type ProductViewerProps = {
	laptop: Laptop;
	back: LaptopBack;
	expansionCards: Record<number, ExpansionCardId>;
	svgRef?: Ref<SVGSVGElement>;
};

export function ProductViewer({
	laptop,
	back,
	expansionCards,
	svgRef,
}: ProductViewerProps) {
	const [imageFailed, setImageFailed] = useState(false);

	useEffect(() => {
		setImageFailed(false);
		const img = new Image();
		img.onerror = () => setImageFailed(true);
		img.src = back.image.src;
	}, [back.image.src]);

	const title = `${laptop.name} in ${back.label}`;
	const { view, image } = back;

	return (
		<div
			aria-label={title}
			className="relative flex aspect-4/3 w-full items-center justify-center lg:aspect-auto lg:h-full"
			role="img"
		>
			{imageFailed ? (
				<FinishFallback laptop={laptop} back={back} />
			) : (
				<svg
					className="h-full max-h-full w-full max-w-full"
					preserveAspectRatio="xMidYMid meet"
					ref={svgRef}
					viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>{title}</title>
					<image
						className="drop-shadow-[0_24px_28px_rgba(0,0,0,0.35)]"
						height={image.height}
						href={image.src}
						width={image.width}
						x={0}
						y={0}
					/>
					{laptop.expansionCardSlots.map((slot) => {
						if (!slot.position) return null;
						const card = getExpansionCardById(expansionCards[slot.slot]);
						if (!card?.image) return null;
						return (
							<ExpansionCardOverlay
								card={card}
								cardSize={laptop.expansionCardSize}
								key={slot.slot}
								placement={slot.position}
								scaleX={slot.scale?.x ?? 1}
								scaleY={slot.scale?.y ?? 1}
								slotNumber={slot.slot}
							/>
						);
					})}
				</svg>
			)}
		</div>
	);
}

function ExpansionCardOverlay({
	card,
	cardSize,
	placement,
	scaleX,
	scaleY,
	slotNumber,
}: {
	card: ExpansionCard;
	cardSize: { width: number; height: number };
	placement: ExpansionCardPlacement;
	scaleX: number;
	scaleY: number;
	slotNumber: number;
}) {
	if (!card.image) return null;
	const crop = card.imageCrop ?? {
		x: 0,
		y: 0,
		width: card.image.width,
		height: card.image.height,
	};
	const rotate = placement.rotate ?? 0;
	const isSide = Math.abs(rotate) === 90 || Math.abs(rotate) === 270;
	// Apply scale in visual (post-rotation) space so `scaleX` always means
	// horizontal-on-screen, regardless of the card's rotation.
	const visualWidthBase = isSide ? cardSize.height : cardSize.width;
	const visualHeightBase = isSide ? cardSize.width : cardSize.height;
	const visualWidth = visualWidthBase * scaleX;
	const visualHeight = visualHeightBase * scaleY;
	const scaledWidth = isSide ? visualHeight : visualWidth;
	const scaledHeight = isSide ? visualWidth : visualHeight;
	const cx = placement.x + visualWidth / 2;
	const cy = placement.y + visualHeight / 2;
	const preRotationX = cx - scaledWidth / 2;
	const preRotationY = cy - scaledHeight / 2;

	const clipId = `card-${slotNumber}-clip`;
	const cornerRadius = Math.min(crop.width, crop.height) * 0.04;
	const cardSvg = (
		<svg
			height={scaledHeight}
			preserveAspectRatio="none"
			viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`}
			width={scaledWidth}
			x={preRotationX}
			y={preRotationY}
		>
			<title>{`${card.label} expansion card in slot ${slotNumber}`}</title>
			<defs>
				<clipPath id={clipId}>
					<rect
						height={crop.height}
						rx={cornerRadius}
						ry={cornerRadius}
						width={crop.width}
						x={crop.x}
						y={crop.y}
					/>
				</clipPath>
			</defs>
			<image
				clipPath={`url(#${clipId})`}
				height={card.image.height}
				href={card.image.src}
				opacity={0.95}
				preserveAspectRatio="none"
				width={card.image.width}
				x={0}
				y={0}
			/>
			<rect
				fill="none"
				height={crop.height}
				rx={cornerRadius}
				ry={cornerRadius}
				stroke="rgba(0, 0, 0, 0.25)"
				strokeWidth={1.5}
				vectorEffect="non-scaling-stroke"
				width={crop.width}
				x={crop.x}
				y={crop.y}
			/>
		</svg>
	);

	return rotate === 0 ? (
		cardSvg
	) : (
		<g transform={`rotate(${rotate} ${cx} ${cy})`}>{cardSvg}</g>
	);
}

function FinishFallback({
	laptop,
	back,
}: {
	laptop: Laptop;
	back: LaptopBack;
}) {
	return (
		<div className="flex max-w-md flex-col items-center gap-4 p-8 text-center">
			<div
				aria-hidden
				className="h-24 w-24 rounded-full ring-1 ring-foreground/10"
				style={{
					background: `linear-gradient(135deg, ${back.shell} 0 55%, ${back.accent} 55% 100%)`,
				}}
			/>
			<div className="space-y-1">
				<p className="text-base font-medium text-foreground">
					{back.label} preview
				</p>
				<p className="text-sm text-muted">
					Expected image at{" "}
					<code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs">
						public{back.image.src}
					</code>{" "}
					for {laptop.name}.
				</p>
			</div>
		</div>
	);
}
