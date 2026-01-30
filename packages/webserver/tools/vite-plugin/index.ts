import type { Plugin } from "vite";

export interface WebServerPluginOptions {
	/**
	 * Directory to scan for route files
	 * @default "routes"
	 */
	routesDir?: string;

	/**
	 * Output directory for generated files
	 * @default ".webserver"
	 */
	outDir?: string;

	/**
	 * Whether to generate OpenAPI spec
	 * @default true
	 */
	generateOpenApi?: boolean;

	/**
	 * Whether to generate TypeScript types
	 * @default true
	 */
	generateTypes?: boolean;

	/**
	 * Whether to generate client code
	 * @default true
	 */
	generateClient?: boolean;
}

/**
 * Vite plugin for @wpackages/webserver
 *
 * Features:
 * - Watch route files and regenerate types/OpenAPI on change
 * - HMR-friendly dev server integration
 * - Generate route manifest, TypeScript types, OpenAPI spec, and client code
 */
export function webserverPlugin(options: WebServerPluginOptions = {}): Plugin {
	const {
		routesDir = "routes",
		outDir = ".webserver",
		generateOpenApi = true,
		generateTypes = true,
		generateClient = true,
	} = options;

	let _server: any = null;

	return {
		name: "vite-plugin-webserver",

		configResolved(config: any) {
			// Store reference to dev server for HMR
			_server = config.server;
		},

		configureServer(server: any) {
			// Watch for changes in routes directory
			server.watcher.on("all", (event: string, path: string) => {
				if (path.includes(routesDir)) {
					console.log(`[webserver] ${event}: ${path}`);
					// Regenerate types/OpenAPI on route changes
					void generateArtifacts();
				}
			});
		},

		async buildStart() {
			// Generate artifacts on build start
			await generateArtifacts();
		},

		async handleHotUpdate({ file, server }: { file: string; server: any }) {
			// If route file changed, invalidate modules
			if (file.includes(routesDir)) {
				console.log(`[webserver] Route changed: ${file}`);
				await generateArtifacts();

				// Invalidate generated files
				const mod = server.moduleGraph.getModuleById(`${outDir}/routes.gen.ts`);
				if (mod) {
					server.moduleGraph.invalidateModule(mod);
				}

				return [];
			}
		},
	};

	async function generateArtifacts() {
		console.log("[webserver] Generating artifacts...");

		// Scan routes
		const { scanRoutes } = await import("./scanner.js");
		const routes = await scanRoutes(routesDir);

		if (routes.length === 0) {
			console.log("[webserver] No routes found, skipping generation");
			return;
		}

		// Generate TypeScript types
		if (generateTypes) {
			const { generateTypes } = await import("./generators/types.js");
			const typesCode = generateTypes(routes);
			console.log(`[webserver] Generated TypeScript types (${typesCode.length} chars)`);
		}

		// Generate OpenAPI spec
		if (generateOpenApi) {
			const { generateOpenApi } = await import("./generators/openapi.js");
			const openApiSpec = generateOpenApi(routes);
			console.log(`[webserver] Generated OpenAPI spec (${openApiSpec.length} chars)`);
		}

		// Generate client code
		if (generateClient) {
			const { generateClient } = await import("./generators/client.js");
			const clientCode = generateClient(routes);
			console.log(`[webserver] Generated client code (${clientCode.length} chars)`);
		}

		console.log("[webserver] Artifacts generated successfully");
	}
}
