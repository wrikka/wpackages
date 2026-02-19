import {
	defineConfig,
	presetUno,
	presetAttributify,
	presetIcons,
	presetTypography,
	presetWebFonts,
	transformerDirectives,
	transformerVariantGroup,
} from "unocss";

export default defineConfig({
	presets: [
		presetUno(),
		presetAttributify(),
		presetIcons({
			scale: 1.2,
			warn: true,
			extraProperties: {
				display: "inline-block",
				"vertical-align": "middle",
			},
		}),
		presetTypography(),
		presetWebFonts({
			fonts: {
				sans: "Inter:400,500,600,700",
				mono: ["Fira Code", "JetBrains Mono", "monospace"],
			},
		}),
	],
	transformers: [transformerDirectives(), transformerVariantGroup()],
	shortcuts: {
		btn: "rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
		"btn-primary":
			"bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700",
		"btn-secondary":
			"border border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white",
		"btn-danger": "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
		"btn-success":
			"bg-green-500 text-white hover:bg-green-600 active:bg-green-700",
		input:
			"w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
		card: "rounded-lg border border-gray-700 bg-gray-800 p-4",
		"card-header": "mb-4 border-b border-gray-700 pb-2",
		"card-title": "text-lg font-semibold text-gray-100",
		"card-content": "text-sm text-gray-300",
		badge:
			"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
		"badge-primary": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
		"badge-success":
			"bg-green-500/10 text-green-400 border border-green-500/20",
		"badge-warning":
			"bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
		"badge-danger": "bg-red-500/10 text-red-400 border border-red-500/20",
		skeleton: "animate-pulse bg-gray-700 rounded",
		"fade-in": "animate-fade-in",
		"slide-in": "animate-slide-in",
		spin: "animate-spin",
		bounce: "animate-bounce",
	},
	theme: {
		colors: {
			terminal: {
				bg: "#0d1117",
				fg: "#c9d1d9",
				cursor: "#58a6ff",
				black: "#0d1117",
				red: "#f85149",
				green: "#238636",
				yellow: "#d29922",
				blue: "#58a6ff",
				magenta: "#bc8cff",
				cyan: "#39c5cf",
				white: "#c9d1d9",
				brightBlack: "#484f58",
				brightRed: "#ff7b72",
				brightGreen: "#3fb950",
				brightYellow: "#d29922",
				brightBlue: "#58a6ff",
				brightMagenta: "#d2a8ff",
				brightCyan: "#56d4dd",
				brightWhite: "#ffffff",
			},
		},
		fontFamily: {
			sans: ["Inter", "system-ui", "sans-serif"],
			mono: ["Fira Code", "JetBrains Mono", "monospace"],
		},
	},
	rules: [
		["text-shadow", { "text-shadow": "0 1px 2px rgba(0,0,0,0.1)" }],
		["text-shadow-lg", { "text-shadow": "0 4px 6px rgba(0,0,0,0.2)" }],
	],
});
