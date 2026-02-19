import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "Styling",
			fileName: "styling",
		},
		rollupOptions: {
			// Make sure to externalize deps that shouldn't be bundled
			// into your library
			external: [
				"@tailwindcss/node",
				"@tailwindcss/oxide",
				/^@tailwindcss\/oxide-.*$/,
			],
			output: {
				// Provide global variables to use in the UMD build
				// for externalized deps
				globals: {},
			},
		},
	},
});
