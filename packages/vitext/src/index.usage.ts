// Usage example for the Vitext framework

import { createVitextApp } from "./index";

// Create a basic vitext application
const app = await createVitextApp();

console.log("Vitext app created with config:", app.config);

// Start the development server
// await app.start()

// Build the application
// await app.build({
//   outDir: 'dist',
//   assetsDir: 'assets'
// })

// Create an app with custom configuration
const customApp = await createVitextApp({
	server: {
		port: 8080,
		hostname: "0.0.0.0",
	},
	root: "./src",
	base: "/app/",
});

console.log("Custom vitext app created with config:", customApp.config);
