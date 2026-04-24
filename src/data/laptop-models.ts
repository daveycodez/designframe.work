export type LaptopModel = {
	id: "laptop-12" | "laptop-13" | "laptop-13-pro" | "laptop-16";
	name: string;
	tagline: string;
	description: string;
	image?: string;
	status: "live" | "coming-soon";
};

export const LAPTOP_MODELS: ReadonlyArray<LaptopModel> = [
	{
		id: "laptop-12",
		name: "Framework Laptop 12",
		tagline: "Compact, colorful, and made to last",
		description:
			"A 12.2-inch 2-in-1 with a convertible 360° hinge. Five playful finishes designed to be swapped and repaired.",
		image: "/images/laptop-12/backs/sage.png",
		status: "live",
	},
	{
		id: "laptop-13",
		name: "Framework Laptop 13",
		tagline: "The most upgradeable laptop ever made",
		description:
			"A 13.5-inch productivity laptop with swappable ports, user-upgradable memory, storage, and mainboard.",
		image: "/images/laptop-13/backs/silver.png",
		status: "live",
	},
	{
		id: "laptop-13-pro",
		name: "Framework Laptop 13 Pro",
		tagline: "A pro-grade take on the 13",
		description:
			"A refined Framework Laptop 13 with a graphite finish, tuned for a premium, blacked-out look.",
		image: "/images/laptop-13-pro/graphite.png",
		status: "live",
	},
	{
		id: "laptop-16",
		name: "Framework Laptop 16",
		tagline: "Modular performance with a swappable GPU",
		description:
			"A 16-inch creator and gaming notebook. Mix and match input modules and a hot-swappable graphics module.",
		image: "/images/laptop-16/backs/silver.png",
		status: "live",
	},
] as const;
