import { ToggleButton } from "@heroui/react";

type OptionCardProps = {
	id: string;
	label: string;
	swatch: React.ReactNode;
	outline: string;
};

export function OptionCard({ id, label, swatch, outline }: OptionCardProps) {
	return (
		<ToggleButton
			aria-label={label}
			className="flex h-full w-full flex-col items-center gap-1.5 px-3 py-4 text-foreground data-[selected=true]:bg-background data-[selected=true]:text-foreground data-[selected=true]:ring-2 data-[selected=true]:ring-[var(--option-outline)] data-[selected=true]:ring-inset"
			id={id}
			style={{ ["--option-outline" as never]: outline }}
		>
			{swatch}
			<span className="flex h-8 items-center text-center text-[12px] font-medium leading-tight whitespace-normal break-words">
				{label}
			</span>
		</ToggleButton>
	);
}

type OptionSwatchProps = {
	className?: string;
	style?: React.CSSProperties;
};

export function OptionSwatch({ className, style }: OptionSwatchProps) {
	return (
		<span
			aria-hidden
			className={`relative block size-11 shrink-0 overflow-hidden rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.08)] ring-1 ring-foreground/10 ${className ?? ""}`}
			style={style}
		/>
	);
}
