import { Check } from "@gravity-ui/icons";
import { Button, Disclosure, Link } from "@heroui/react";
import { useState } from "react";

type SectionHeaderProps = {
	title: string;
	value?: string;
	faqHref?: string;
	completed?: boolean;
	children: React.ReactNode;
	defaultExpanded?: boolean;
};

export function ConfigurationSection({
	title,
	value,
	faqHref,
	completed = true,
	children,
	defaultExpanded = true,
}: SectionHeaderProps) {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);

	return (
		<section className="border-b border-foreground/10 py-5">
			<Disclosure isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
				<Disclosure.Heading>
					<Button
						className="flex h-auto w-full items-start justify-between gap-4 bg-transparent px-0 py-0 text-left hover:bg-transparent"
						slot="trigger"
						variant="ghost"
					>
						<div className="flex items-start gap-3">
							<span
								aria-hidden
								className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
									completed
										? "bg-accent text-accent-foreground"
										: "bg-foreground/10 text-foreground/40"
								}`}
							>
								<Check className="size-3" />
							</span>
							<div className="flex flex-col leading-tight">
								<span className="text-[17px] font-semibold tracking-tight text-foreground">
									{title}
								</span>
								{value ? (
									<span className="mt-0.5 text-[13px] text-muted">{value}</span>
								) : null}
							</div>
						</div>
						<div className="flex items-center gap-3 pt-0.5 text-muted">
							{faqHref ? (
								<Link
									className="text-[13px]"
									href={faqHref}
									rel="noreferrer"
									target="_blank"
								>
									FAQ
								</Link>
							) : null}
							<Disclosure.Indicator />
						</div>
					</Button>
				</Disclosure.Heading>
				<Disclosure.Content>
					<Disclosure.Body className="mt-4">{children}</Disclosure.Body>
				</Disclosure.Content>
			</Disclosure>
		</section>
	);
}
