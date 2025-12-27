import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as z from "zod";

async function generateSchemas() {
	// Import schemas from source TypeScript files
	const { GitStatusSchema } = await import("../src/types/status");
	const { GitLogEntrySchema } = await import("../src/types/log");

	// Generate JSON schemas
	const schemas = {
		GitStatus: z.toJSONSchema(GitStatusSchema),
		GitLogEntry: z.toJSONSchema(GitLogEntrySchema),
	};

	// Ensure dist folder exists
	const distPath = join(process.cwd(), "dist");
	mkdirSync(distPath, { recursive: true });

	// Write schemas to dist folder
	writeFileSync(join(distPath, "schemas.json"), JSON.stringify(schemas, null, 2));

	console.log("✅ Generated schemas.json in dist folder");
}

// Execute the function
await generateSchemas();
