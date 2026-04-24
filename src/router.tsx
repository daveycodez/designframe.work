import {
	createRouter as createTanStackRouter,
	defaultStringifySearch,
} from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

/**
 * Wrap the default stringifier to keep commas unencoded in the query
 * string. Commas are RFC 3986 sub-delims and browsers happily round-trip
 * them unescaped, so `?expansion-cards=a,b,c` stays readable and shareable
 * instead of `?expansion-cards=a%2Cb%2Cc`. Parsing is symmetric because
 * `URLSearchParams` treats `,` and `%2C` identically.
 */
const stringifySearch = (search: Record<string, unknown>): string =>
	defaultStringifySearch(search).replace(/%2C/gi, ",");

export function getRouter() {
	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		stringifySearch,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
