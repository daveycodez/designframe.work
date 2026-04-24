import { Display, Moon, Sun } from "@gravity-ui/icons";
import { Button, Dropdown, Label } from "@heroui/react";
import { useHydrated } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import type { ComponentType, SVGProps } from "react";

type ThemeId = "system" | "light" | "dark";

type ThemeOption = {
	id: ThemeId;
	label: string;
	Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const THEME_OPTIONS: readonly ThemeOption[] = [
	{ id: "system", label: "System", Icon: Display },
	{ id: "light", label: "Light", Icon: Sun },
	{ id: "dark", label: "Dark", Icon: Moon },
];

const isThemeId = (value: unknown): value is ThemeId =>
	value === "system" || value === "light" || value === "dark";

export function ThemeToggle() {
	const hydrated = useHydrated();
	const { theme, resolvedTheme, setTheme } = useTheme();

	const current: ThemeId = hydrated && isThemeId(theme) ? theme : "system";
	const resolved = hydrated ? resolvedTheme : "dark";
	const CurrentIcon = resolved === "light" ? Sun : Moon;

	return (
		<Dropdown>
			<Button aria-label="Toggle theme" isIconOnly variant="ghost">
				<CurrentIcon />
			</Button>
			<Dropdown.Popover>
				<Dropdown.Menu
					disallowEmptySelection
					onSelectionChange={(keys) => {
						if (keys === "all") return;
						const [next] = keys;
						if (isThemeId(next)) setTheme(next);
					}}
					selectedKeys={new Set([current])}
					selectionMode="single"
				>
					{THEME_OPTIONS.map(({ id, label, Icon }) => (
						<Dropdown.Item id={id} key={id} textValue={label}>
							<Icon className="size-4 shrink-0 text-muted" />
							<Label>{label}</Label>
						</Dropdown.Item>
					))}
				</Dropdown.Menu>
			</Dropdown.Popover>
		</Dropdown>
	);
}
