import type { BunpackConfig } from '../types';

export const appPreset: Partial<BunpackConfig> = {
  target: 'bun',
  format: ['esm'],
  dts: false,
};
