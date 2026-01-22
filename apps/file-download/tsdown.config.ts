import { defineConfig } from "tsdown";

export default defineConfig({
	dts: {
		sourcemap: true,
		vue: false,
	},
	exports: true,
	entry: ["./src/index.ts", "./src/cli.ts"],
	format: "esm",
	clean: true,
	minify: true,
	plugins: [],
	hooks: {},
});
