import type { BunpackConfig } from '../types';

import { BuildError } from '../error';

export async function sveltePreset(): Promise<Partial<BunpackConfig>> {
  try {
    const mod = (await import('bun-plugin-svelte')) as unknown as { default: unknown };
    const svelte = mod.default as any;
    return {
      bunPlugins: [
        svelte(),
      ],
    };
  } catch (cause) {
    throw new BuildError({
      code: 'PRESET_DEP_MISSING',
      step: 'config',
      message: "Missing dependency for preset 'svelte'.",
      hint: "Install 'bun-plugin-svelte' in your project.",
      cause,
    });
  }
}
