import { generatedRoutes } from "../generated/routes";
import { createWebServer } from "../lib";

export const app = createWebServer({ port: 3001, host: "localhost" });

// Register all routes generated from the file system
for (const route of generatedRoutes) {
	app.route(route);
}
