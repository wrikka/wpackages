import type { WRouteRecord } from "../types";

export type VirtualRoutesModule = {
	readonly routes: readonly WRouteRecord[];
};

export const generateVirtualRoutesModuleCode = (routes: readonly WRouteRecord[]): string => {
	const body = JSON.stringify(routes);
	return `export const routes = ${body};\nexport default routes;\n`;
};
