import type { BunpackConfig } from '../types';

import { BuildError } from '../error';

export async function vuePreset(): Promise<Partial<BunpackConfig>> {
  try {
    const mod = (await import('bun-plugin-vue')) as unknown as { default: unknown };
    const vue = mod.default as any;
    return {
      bunPlugins: [
        vue(),
      ],
    };
  } catch (cause) {
    throw new BuildError({
      code: 'PRESET_DEP_MISSING',
      step: 'config',
      message: "Missing dependency for preset 'vue'.",
      hint: "Install 'bun-plugin-vue' in your project.",
      cause,
    });
  }
}
