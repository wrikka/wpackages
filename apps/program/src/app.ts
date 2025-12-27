/**
 * Main application entry point for the program framework
 *
 * This file composes the layers and runs the program.
 */

import { ProgramComponent } from "./components";

import { initConfig } from "./config/loader";

/**
 * Main application function
 */
export async function main(): Promise<void> {
	try {
		// Initialize configuration
		const config = await initConfig();

		// Render the main component
		const output = ProgramComponent.render({
			title: "program",
			version: "0.1.0",
			description: "Enhanced Functional Programming Framework",
		});

		console.log(output);

		// Log configuration
		console.log("Configuration loaded:", config);
	} catch (error) {
		console.error("Application error:", error);
		process.exit(1);
	}
}

/**
 * Run the application if this file is executed directly
 */
if (import.meta.main) {
	main().catch(console.error);
}
