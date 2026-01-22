import {
	defineConfig,
	presetIcons,
	presetWind,
	transformerCompileClass,
	transformerDirectives,
	transformerVariantGroup,
} from "unocss";

export default defineConfig({
	presets: [
		presetWind({
			preflights: {
				darkMode: "class",
				reset: true,
			},
		}),
		presetIcons({
			scale: 1.2,
			warn: true,
		}),
	],
	transformers: [
		transformerVariantGroup(),
		transformerDirectives(),
		transformerCompileClass(),
	],
});
