import { join } from "path";

import { createWebServer } from "../src/lib";

import { loadFileRoutes } from "./file-routing/load-routes";

const app = createWebServer({ port: 3002, host: "localhost" });

const routesRoot = join(import.meta.dir, "routes");
const importBase = new URL("./routes", import.meta.url).href;

const routes = await loadFileRoutes({ routesRoot, importBase });
for (const route of routes) {
	app.route(route);
}

app.start().catch((error) => {
	console.error("Failed to start server:", error);
	process.exit(1);
});
