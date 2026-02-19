import type { DevServerConfig } from "devserver";
import { defineConfig } from "./src/index";

export default defineConfig({
	server: {
		port: 3000,
		hostname: "localhost",
	} satisfies DevServerConfig,
	root: "./src",
	base: "/",
	build: {
		outDir: "dist",
		assetsDir: "assets",
		minify: true,
		sourcemap: true,
	},
	define: {
		__VERSION__: JSON.stringify("1.0.0"),
	},
	mode: "development",
});
