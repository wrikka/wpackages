import type { RouteInfo } from "../scanner";

/**
 * Generate client code from routes
 */
export function generateClient(routes: RouteInfo[]): string {
	const clientCode: string[] = [];

	clientCode.push("// Auto-generated client code");
	clientCode.push("export const createClient = (baseUrl: string) => {");
	clientCode.push("  return {");

	for (const { route } of routes) {
		const routeName = route.path.replace(/\//g, "_").replace(/:/g, "").replace(/\{|\}/g, "");
		const method = route.method.toLowerCase();

		clientCode.push(`    ${routeName}: async (data?: any) => {`);
		clientCode.push(`      const response = await fetch(\`\${baseUrl}${route.path}\`, {`);
		clientCode.push(`        method: "${method}",`);
		clientCode.push(`        headers: {`);
		clientCode.push(`          "Content-Type": "application/json",`);
		clientCode.push(`        },`);
		clientCode.push(`        body: data ? JSON.stringify(data) : undefined,`);
		clientCode.push(`      });`);
		clientCode.push(`      return response.json();`);
		clientCode.push(`    },`);
	}

	clientCode.push("  };");
	clientCode.push("};");

	return clientCode.join("\n");
}
