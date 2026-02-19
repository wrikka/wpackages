import { defineConfig } from "@wpackages/ts-build";

export default defineConfig({
	name: "native-lib",
	entry: ["src/index.ts"],
	outDir: "dist",
	preset: "library",
	native: {
		napi: {
			crateDir: "native",
			outFile: "native-lib", // This should match the name in Cargo.toml
			release: true,
		},
	},
});
