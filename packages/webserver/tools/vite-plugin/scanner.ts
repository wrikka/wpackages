import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import type { RouteDefinition, RouteWithSchema } from "../../src/types";

export interface RouteInfo {
	filePath: string;
	route: RouteDefinition;
}

/**
 * Scan routes directory and extract route definitions
 */
export async function scanRoutes(
	routesDir: string,
): Promise<RouteInfo[]> {
	const routes: RouteInfo[] = [];

	try {
		// Check if routes directory exists
		const stats = statSync(routesDir);
		if (!stats.isDirectory()) {
			console.log(`[webserver] Routes directory not found: ${routesDir}`);
			return routes;
		}

		// Read all files in routes directory
		const files = readdirSync(routesDir);

		for (const file of files) {
			if (!file.endsWith(".ts") && !file.endsWith(".tsx")) {
				continue;
			}

			const filePath = join(routesDir, file);
			const content = readFileSync(filePath, "utf-8");

			// Parse route definitions from file
			const route = parseRouteFromFile(content, filePath);
			if (route) {
				routes.push({ filePath, route });
			}
		}

		console.log(`[webserver] Found ${routes.length} routes in ${routesDir}`);
	} catch (error) {
		console.error(`[webserver] Error scanning routes:`, error);
	}

	return routes;
}

/**
 * Parse route definition from file content
 */
function parseRouteFromFile(
	content: string,
	_filePath: string,
): RouteDefinition | null {
	// Simple regex-based parsing for now
	// TODO: Use AST parsing for better accuracy

	// Look for route definitions like:
	// app.get('/path', handler)
	// app.post('/path', handler)
	// etc.

	const methodMatch = content.match(/app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
	if (!methodMatch) {
		return null;
	}

	const method = methodMatch[1].toUpperCase();
	const path = methodMatch[2];

	// Try to extract handler function
	const handlerMatch = content.match(/app\.(get|post|put|delete|patch)\s*\(\s*['"`][^'"`]+['"`]\s*,\s*(.+?)\s*\)/);
	if (!handlerMatch) {
		return null;
	}

	// Create a simple route definition
	const route: RouteDefinition = {
		method: method as any,
		path,
		handler: () => ({}), // Placeholder handler
	};

	// Try to extract schema if present
	const schemaMatch = content.match(/schema:\s*{([^}]+)}/);
	if (schemaMatch) {
		// TODO: Parse schema properly
		(route as RouteWithSchema).schema = {} as any;
	}

	return route;
}
