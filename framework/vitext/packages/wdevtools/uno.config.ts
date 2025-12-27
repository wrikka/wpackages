import { defineConfig, presetWind, transformerVariantGroup, transformerDirectives, transformerCompileClass } from 'unocss'

export default defineConfig({
  presets: [
    presetWind(),
  ],
  transformers: [
    transformerVariantGroup(),
    transformerDirectives(),
    transformerCompileClass(),
  ],
})
