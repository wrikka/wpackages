import vue from "@vitejs/plugin-vue";
import unocss from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [vue(), unocss()],
	build: {
		outDir: "dist/client",
		rollupOptions: {
			input: {
				client: "src/client/index.ts",
			},
			output: {
				entryFileNames: "[name].js",
				assetFileNames: "[name].[ext]",
			},
		},
	},
});
