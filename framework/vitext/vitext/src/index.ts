import { createVitextApp } from "./app";
import { defineConfig } from "./config/vitext";
import { DevServer } from "./services/dev-server";

export type { DevServerInstance } from "w-devserver";
export type { BuildConfig, VitextConfig } from "./types/config";
export type { VitextServer } from "./types/server";
export type { VitextAppInstance } from "./app";

export { createVitextApp, defineConfig, DevServer };

// CLI entry point
if (import.meta.main) {
	const app = await createVitextApp();
	console.log("Vitext framework initialized!");
	console.log(`Server will run on port ${app.config.server.port}`);
}

