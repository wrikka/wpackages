import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import stylingPlugin from "../../src/index";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		stylingPlugin({
			preset: "wind4",
			icons: ["mdi"],
			fonts: [
				{
					source: "google",
					name: "Inter",
					weights: [400, 700],
				},
			],
			theme: {
				colors: {
					primary: "#007bff",
				},
				fontFamily: {
					sans: ["Inter", "sans-serif"],
				},
			},
			rules: [
				[/^m-([\d.]+)$/, ([, d]) => ({ margin: `${Number(d) / 4}rem` })],
			],
			shortcuts: {
				"btn-primary": "p-2 rounded bg-primary text-white",
			},
		}),
	],
});
