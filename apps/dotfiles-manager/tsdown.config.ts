import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "tsdown";

export default defineConfig({
	exports: true,
	dts: true,
	entry: ["src/index.ts"],
	hooks(hooks) {
		hooks.hook("build:prepare", async () => {
			try {
				const { zodToJsonSchema } = await import("zod-to-json-schema");
				const { configSchema } = await import("./src/types/config");

				const schema = zodToJsonSchema(configSchema as any, {
					name: "DotfilesConfig",
					target: "jsonSchema7",
				});
				const schemaPath = join(process.cwd(), "public/schema.json");
				writeFileSync(schemaPath, JSON.stringify(schema, null, 2), "utf-8");
				console.log(`✅ Generated config schema at: ${schemaPath}`);
			} catch (error) {
				console.warn("⚠️  Could not generate config schema:", error);
			}
		});
	},
});
