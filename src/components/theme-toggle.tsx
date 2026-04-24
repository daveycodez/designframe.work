import { Moon, Sun } from "@gravity-ui/icons";
import { Button, Dropdown, Label } from "@heroui/react";
import { useHydrated } from "@tanstack/react-router";
import { useTheme } from "next-themes";

const THEME_OPTIONS = [
	{ id: "system", label: "System" },
	{ id: "light", label: "Light" },
	{ id: "dark", label: "Dark" },
] as const;

type ThemeId = (typeof THEME_OPTIONS)[number]["id"];

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
			<Dropdown.Popover className="min-w-[160px]">
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
					{THEME_OPTIONS.map(({ id, label }) => (
						<Dropdown.Item id={id} key={id} textValue={label}>
							<Dropdown.ItemIndicator />
							<Label>{label}</Label>
						</Dropdown.Item>
					))}
				</Dropdown.Menu>
			</Dropdown.Popover>
		</Dropdown>
	);
}
