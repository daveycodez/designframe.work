import {
	createRouter as createTanStackRouter,
	defaultStringifySearch,
} from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

/**
 * Fixed order for well-known search params; any keys not listed here are
 * appended after these in their original insertion order. Keeping `color`
 * first makes shared URLs read configuration-first (the thing you can see
 * at a glance) and keeps URLs stable regardless of the order callers
 * happen to build their search object in.
 */
const SEARCH_PARAM_ORDER = ["color", "expansion-cards"] as const;

/**
 * Wrap the default stringifier to:
 * 1. Enforce a stable key order (see `SEARCH_PARAM_ORDER`).
 * 2. Keep commas unencoded in the query string. Commas are RFC 3986
 *    sub-delims and browsers happily round-trip them unescaped, so
 *    `?expansion-cards=a,b,c` stays readable and shareable instead of
 *    `?expansion-cards=a%2Cb%2Cc`. Parsing is symmetric because
 *    `URLSearchParams` treats `,` and `%2C` identically.
 */
const stringifySearch = (search: Record<string, unknown>): string => {
	const ordered: Record<string, unknown> = {};
	for (const key of SEARCH_PARAM_ORDER) {
		if (key in search) ordered[key] = search[key];
	}
	for (const key of Object.keys(search)) {
		if (!(key in ordered)) ordered[key] = search[key];
	}
	return defaultStringifySearch(ordered).replace(/%2C/gi, ",");
};

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
