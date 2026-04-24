import { ArrowRight, Cpu, Palette, Wrench } from "@gravity-ui/icons";
import { Button, Card, Chip, Link } from "@heroui/react";
import {
	createFileRoute,
	Link as RouterLink,
	useNavigate,
} from "@tanstack/react-router";

import { LAPTOP_MODELS } from "#/data/laptop-models";
import { getLaptopById } from "#/data/laptops";

export const Route = createFileRoute("/")({ component: Home });

const features = [
	{
		icon: Palette,
		title: "Five playful finishes",
		description: "Swap back panels anytime — from Sage to Bubblegum to Black.",
	},
	{
		icon: Wrench,
		title: "Repairable by design",
		description:
			"Every part is user-replaceable. No glue, no proprietary tools.",
	},
	{
		icon: Cpu,
		title: "Upgrade as you grow",
		description:
			"Hot-swappable expansion cards and user-upgradable mainboards.",
	},
];

function Home() {
	const navigate = useNavigate();

	return (
		<>
			<section className="relative overflow-hidden border-b border-foreground/10 bg-gradient-to-b from-background via-background to-foreground/[0.03]">
				<div className="mx-auto max-w-6xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
					<div className="mx-auto max-w-3xl text-center">
						<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-3 py-1 text-xs font-medium text-muted">
							<span className="h-1.5 w-1.5 rounded-full bg-accent" />
							Configure a Framework laptop
						</div>
						<h1 className="text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
							Build your Framework.
						</h1>
						<p className="mt-5 text-balance text-lg text-muted sm:text-xl">
							Explore finishes, expansion bay colors, and back panels across the
							Framework laptop line. Designed to be yours, designed to last.
						</p>
						<div className="mt-10 flex flex-wrap items-center justify-center gap-3">
							<Button
								onPress={() => {
									void navigate({
										to: "/$laptop",
										params: { laptop: "laptop-12" },
									});
								}}
								size="lg"
							>
								Start with Laptop 12
								<ArrowRight />
							</Button>
						</div>
					</div>
				</div>
			</section>

			<section className="border-b border-foreground/10">
				<div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
					<div className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
								Pick a laptop
							</h2>
							<p className="mt-2 max-w-xl text-muted">
								Four models. Same repairable, upgradeable philosophy.
							</p>
						</div>
						<Link className="text-sm" href="https://frame.work" target="_blank">
							Compare all models
							<Link.Icon />
						</Link>
					</div>

					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
						{LAPTOP_MODELS.map((model) => {
							const isLive = model.status === "live";
							const laptop = getLaptopById(model.id);
							const back = laptop?.backs[0];
							const preview = back ? (
								<svg
									aria-label={model.name}
									className="absolute inset-0 h-full w-full p-6 transition-transform duration-500 group-hover:scale-[1.03]"
									preserveAspectRatio="xMidYMid meet"
									role="img"
									viewBox={`${back.view.x} ${back.view.y} ${back.view.width} ${back.view.height}`}
									xmlns="http://www.w3.org/2000/svg"
								>
									<title>{model.name}</title>
									<image
										height={back.image.height}
										href={back.image.src}
										width={back.image.width}
										x={0}
										y={0}
									/>
								</svg>
							) : (
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="text-center">
										<div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground/5">
											<Cpu className="size-7 text-muted" />
										</div>
										<p className="text-xs font-medium text-muted">
											Preview coming soon
										</p>
									</div>
								</div>
							);

							const previewContainerClass =
								"group relative block aspect-4/3 overflow-hidden rounded-2xl bg-muted/20 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none";

							return (
								<Card
									className="flex flex-col overflow-hidden transition-all hover:shadow-lg"
									key={model.id}
								>
									{isLive ? (
										<RouterLink
											aria-label={`Design ${model.name}`}
											className={previewContainerClass}
											params={{ laptop: model.id }}
											to="/$laptop"
										>
											{preview}
										</RouterLink>
									) : (
										<div className={previewContainerClass}>
											{preview}
											<div className="absolute top-3 right-3">
												<Chip size="sm">Coming soon</Chip>
											</div>
										</div>
									)}

									<Card.Header className="gap-1.5 pt-5">
										<Card.Title className="text-lg">{model.name}</Card.Title>
										<Card.Description className="text-[13px]">
											{model.tagline}
										</Card.Description>
									</Card.Header>

									<Card.Content>
										<p className="text-sm text-muted">{model.description}</p>
									</Card.Content>

									<Card.Footer className="mt-auto flex items-center justify-end pt-4">
										{isLive ? (
											<Button
												onPress={() => {
													void navigate({
														to: "/$laptop",
														params: { laptop: model.id },
													});
												}}
												size="sm"
												variant="secondary"
											>
												Design
												<ArrowRight />
											</Button>
										) : (
											<Button isDisabled size="sm" variant="outline">
												Notify me
											</Button>
										)}
									</Card.Footer>
								</Card>
							);
						})}
					</div>
				</div>
			</section>

			<section>
				<div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
						{features.map((feature) => {
							const Icon = feature.icon;
							return (
								<div className="flex flex-col gap-3" key={feature.title}>
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
										<Icon className="size-5" />
									</div>
									<h3 className="text-base font-semibold text-foreground">
										{feature.title}
									</h3>
									<p className="text-sm text-muted">{feature.description}</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			<footer className="border-t border-foreground/10">
				<div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-8 text-sm text-muted">
					Created by{" "}
					<Link
						className="ml-1"
						href="https://x.com/daveycodez"
						rel="noopener noreferrer"
						target="_blank"
					>
						@daveycodez
					</Link>
				</div>
			</footer>
		</>
	);
}
