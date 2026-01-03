import { defineConfig, presetIcons, presetWind, transformerVariantGroup, transformerDirectives, transformerCompileClass } from 'unocss'

export default defineConfig({
	presets: [
		presetWind({
			preflights: {
        darkMode : 'class',
				reset: true,
			}
		}),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
	],
	transformers: [
		transformerVariantGroup(),
		transformerDirectives(),
		transformerCompileClass()
	],
})
