import type { RouteInfo } from "./scanner";

/**
 * Generate TypeScript types from routes
 */
export function generateTypes(routes: RouteInfo[]): string {
	const types: string[] = [];

	// Generate route types
	types.push("// Auto-generated route types");
	types.push("export interface Routes {");

	for (const { route } of routes) {
		const routeName = route.path.replace(/\//g, "_").replace(/:/g, "").replace(/\{|\}/g, "");
		types.push(`  ${routeName}: {`);
		types.push(`    method: "${route.method}";`);
		types.push(`    path: "${route.path}";`);
		types.push(`  };`);
	}

	types.push("}");

	return types.join("\n");
}
