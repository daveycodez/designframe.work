import { Cpu, LogoGithub, Palette, Wrench } from "@gravity-ui/icons";
import { Card, Chip, Link } from "@heroui/react";
import { createFileRoute, Link as RouterLink } from "@tanstack/react-router";

import { LAPTOP_MODELS } from "#/data/laptop-models";
import { getLaptopById } from "#/data/laptops";

export const Route = createFileRoute("/")({ component: Home });

const features = [
	{
		icon: Palette,
		title: "Finishes with personality",
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
	return (
		<>
			<section className="relative overflow-hidden border-b border-foreground/10">
				<div
					aria-hidden
					className="pointer-events-none absolute top-0 left-1/2 z-0 h-[360px] w-[900px] max-w-[120%] -translate-x-1/2 rounded-full bg-accent-soft blur-3xl"
				/>

				<div className="relative mx-auto max-w-6xl px-6 pt-12 pb-16 sm:pt-16 sm:pb-20">
					<div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
						<div>
							<h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
								Design your Framework Laptop.
							</h1>
							<p className="mt-3 max-w-xl text-balance text-muted sm:text-lg">
								Preview every color, expansion card, and back panel.
							</p>
						</div>
						<Link
							className="text-sm"
							href="https://frame.work"
							rel="noopener noreferrer"
							target="_blank"
						>
							Compare all models
							<Link.Icon />
						</Link>
					</div>

					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
						{LAPTOP_MODELS.map((model) => {
							const isLive = model.status === "live";
							const laptop = getLaptopById(model.id);
							const back =
								(model.previewBackId
									? laptop?.backs.find((b) => b.id === model.previewBackId)
									: undefined) ?? laptop?.backs[0];
							const shortName = model.name.replace(/^Framework\s+/, "");
							const finishes = laptop?.backs ?? [];

							const previewContainerClass =
								"group/preview relative block aspect-4/3 overflow-hidden bg-surface-secondary rounded-2xl focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none";

							const previewInner = back ? (
								<svg
									aria-label={model.name}
									className="absolute inset-0 h-full w-full p-5 transition-transform duration-500 ease-out group-hover/preview:scale-[1.04]"
									preserveAspectRatio="xMidYMid meet"
									role="img"
									viewBox={`${back.view.x} ${back.view.y} ${back.view.width} ${back.view.height}`}
									xmlns="http://www.w3.org/2000/svg"
								>
									<title>{model.name}</title>
									<image
										className="drop-shadow-[0_24px_28px_rgba(0,0,0,0.35)]"
										height={back.image.height}
										href={back.image.src}
										width={back.image.width}
										x={0}
										y={0}
									/>
								</svg>
							) : (
								<div className="absolute inset-0 flex items-center justify-center">
									<Cpu className="size-8 text-muted" />
								</div>
							);

							return (
								<Card className="flex flex-col overflow-hidden" key={model.id}>
									{isLive ? (
										<RouterLink
											aria-label={`Design ${model.name}`}
											className={previewContainerClass}
											params={{ laptop: model.id }}
											to="/$laptop"
										>
											{previewInner}
										</RouterLink>
									) : (
										<div className={previewContainerClass}>
											{previewInner}
											<div className="absolute top-3 right-3">
												<Chip size="sm">Coming soon</Chip>
											</div>
										</div>
									)}

									<div className="flex flex-1 flex-col gap-4 p-5">
										<div className="flex flex-col gap-1">
											<h3 className="text-lg font-semibold tracking-tight text-foreground">
												{shortName}
											</h3>
											<p className="text-[13px] text-muted">{model.tagline}</p>
										</div>

										{finishes.length > 0 && (
											<div className="mt-auto flex items-center gap-2.5 pt-1">
												<div className="flex -space-x-1.5">
													{finishes.slice(0, 5).map((b) => (
														<span
															aria-hidden
															className="h-4 w-4 rounded-full ring-2 ring-surface"
															key={b.id}
															style={{ backgroundColor: b.shell }}
															title={b.label}
														/>
													))}
												</div>
												<span className="text-xs text-muted">
													{finishes.length === 1
														? "1 finish"
														: `${finishes.length} finishes`}
												</span>
											</div>
										)}
									</div>
								</Card>
							);
						})}
					</div>
				</div>
			</section>

			<section>
				<div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
					<div className="mb-12 max-w-2xl">
						<p className="mb-3 text-xs font-medium tracking-[0.18em] text-muted uppercase">
							Why Framework
						</p>
						<h2 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
							Laptops that adapt, not expire.
						</h2>
					</div>
					<div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
						{features.map((feature) => {
							const Icon = feature.icon;
							return (
								<div className="flex flex-col gap-3" key={feature.title}>
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent ring-1 ring-accent-soft-hover">
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
				<div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 py-8 text-sm text-muted">
					<span>
						🐧{" "}
						<Link
							className="ml-1"
							href="https://x.com/daveycodez"
							rel="noopener noreferrer"
							target="_blank"
						>
							@daveycodez
						</Link>
					</span>
					<span aria-hidden className="text-foreground/20">
						·
					</span>
					<Link
						href="https://github.com/daveycodez/designframe.work"
						rel="noopener noreferrer"
						target="_blank"
					>
						<LogoGithub className="mr-2" />
						GitHub
					</Link>
				</div>
			</footer>
		</>
	);
}
