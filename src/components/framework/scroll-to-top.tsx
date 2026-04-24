import { ArrowUp } from "@gravity-ui/icons";
import { Button } from "@heroui/react";
import { type RefObject, useEffect, useState } from "react";

type ScrollToTopProps = {
	/**
	 * Optional scrollable container (used on desktop where the config aside
	 * scrolls internally). The button also watches window scroll so it works
	 * on mobile where the document itself scrolls.
	 */
	containerRef?: RefObject<HTMLElement | null>;
	threshold?: number;
};

export function ScrollToTop({
	containerRef,
	threshold = 320,
}: ScrollToTopProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const container = containerRef?.current;
		const check = () => {
			const windowScroll = window.scrollY;
			const containerScroll = container?.scrollTop ?? 0;
			setIsVisible(Math.max(windowScroll, containerScroll) > threshold);
		};
		check();
		window.addEventListener("scroll", check, { passive: true });
		container?.addEventListener("scroll", check, { passive: true });
		return () => {
			window.removeEventListener("scroll", check);
			container?.removeEventListener("scroll", check);
		};
	}, [containerRef, threshold]);

	return (
		<Button
			aria-label="Scroll to top"
			className={`fixed right-4 bottom-4 z-30 shadow-lg backdrop-blur transition-opacity duration-200 sm:right-6 sm:bottom-6 ${
				isVisible ? "opacity-100" : "pointer-events-none opacity-0"
			}`}
			isIconOnly
			onPress={() => {
				window.scrollTo({ top: 0, behavior: "smooth" });
				containerRef?.current?.scrollTo({ top: 0, behavior: "smooth" });
			}}
			variant="secondary"
		>
			<ArrowUp />
		</Button>
	);
}
