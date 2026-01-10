import { createDevServer } from "../src";

const devServer = createDevServer({
	root: process.cwd(),
	port: 3000,
	hostname: "localhost",
	server: {
		// Proxy API requests to backend server
		proxy: [
			{
				context: ["/api"],
				target: "http://localhost:8080",
				changeOrigin: true,
				pathRewrite: {
					"^/api": "",
				},
			},
			{
				context: ["/auth"],
				target: "http://localhost:9000",
				changeOrigin: true,
			},
		],
	},
});

devServer.onReload(() => {
	console.log("Files changed, reloading...");
});

void devServer.start();

console.log("Dev server started on http://localhost:3000");
console.log("API requests to /api/* will be proxied to http://localhost:8080");
console.log("Auth requests to /auth/* will be proxied to http://localhost:9000");

process.on("SIGINT", () => {
	devServer.stop().then(() => {
		console.log("Dev server stopped.");
		process.exit(0);
	}).catch((error) => {
		console.error("Error stopping dev server:", error);
		process.exit(1);
	});
});
