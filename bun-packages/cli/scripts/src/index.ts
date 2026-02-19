export * from "./components";
export * from "./config";
export * from "./constant";
export * from "./services";
export * from "./types";
export * from "./utils";

import { runApp } from "./app";

// Run the application if this module is the main entry point
if (import.meta.main) {
	runApp();
}
