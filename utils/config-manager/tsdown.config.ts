import { defineConfig } from "tsdown";

export default defineConfig({
	dts: {
		sourcemap: true,
		vue: false,
	},
	exports: true,
	entry: "./src/index.ts",
	format: "esm",
	clean: true,
	minify: false,
	external: [
		/^@wpackages\//,
		"@iarna/toml",
		"yaml",
	],
	plugins: [],
	hooks: {},
});
