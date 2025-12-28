import { defineConfig } from "tsdown";

export default defineConfig({
	dts: {
		sourcemap: true,
	},
	exports: true,
	entry: "./src/index.ts",
	format: "esm",
	clean: true,
	minify: true,
	plugins: [],
	hooks: {},
});
