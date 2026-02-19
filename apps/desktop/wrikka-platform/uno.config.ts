import {
	defineConfig,
	presetWind4,
	transformerVariantGroup,
	transformerDirectives,
	transformerCompileClass,
} from "unocss";

export default defineConfig({
	presets: [
		presetWind4({
			preflights: {
				reset: true,
			},
		}),
	],
	transformers: [
		transformerVariantGroup(),
		transformerDirectives(),
		transformerCompileClass(),
	],
});
