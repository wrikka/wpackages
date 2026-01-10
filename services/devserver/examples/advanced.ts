import { createDevServer } from "../src";

const devServer = createDevServer({
	root: process.cwd(),
	port: 3000,
	hostname: "localhost",
	alias: {
		"@": "./src",
		"@components": "./src/components",
		"@utils": "./src/utils",
	},
	extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".css", ".vue"],
	cache: {
		enabled: true,
		ttl: 300000,
	},
	watch: {
		ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"],
		debounceMs: 100,
	},
	server: {
		proxy: [
			{
				context: ["/api"],
				target: "http://localhost:8080",
				changeOrigin: true,
				pathRewrite: {
					"^/api": "",
				},
			},
		],
	},
});

devServer.onReload(() => {
	console.log("Files changed, reloading...");
});

void devServer.start();

console.log("Dev server started on http://localhost:3000");
console.log("Features enabled:");
console.log("  - Path aliases (@, @components, @utils)");
console.log("  - Custom file extensions (.ts, .tsx, .js, .jsx, .json, .css, .vue)");
console.log("  - Transform cache (5 min TTL)");
console.log("  - File watching with debouncing (100ms)");
console.log("  - API proxy to http://localhost:8080");

const stats = devServer.getStats();
console.log("\nServer stats:", stats);

const recommendations = devServer.getRecommendations();
if (recommendations.length > 0) {
	console.log("\nRecommendations:");
	recommendations.forEach((rec) => console.log(`  - ${rec}`));
}

process.on("SIGINT", () => {
	devServer.stop().then(() => {
		console.log("Dev server stopped.");
		process.exit(0);
	}).catch((error) => {
		console.error("Error stopping dev server:", error);
		process.exit(1);
	});
});
