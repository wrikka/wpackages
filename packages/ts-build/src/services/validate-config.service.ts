import type { BunpackConfig, Format, Target } from '../types';
import { BuildError } from '../error';

export function validateConfig(config: BunpackConfig): void {
  if (!config.entry) {
    throw new BuildError({
      code: 'MISSING_ENTRY',
      step: 'config',
      message: 'Entry point is required.',
      hint: 'Set entry in your config, e.g., entry: ["src/index.ts"].',
    });
  }

  if (!config.outDir) {
    throw new BuildError({
      code: 'MISSING_OUT_DIR',
      step: 'config',
      message: 'Output directory is required.',
      hint: 'Set outDir in your config, e.g., outDir: "dist".',
    });
  }

  const formats = Array.isArray(config.format) ? config.format : [config.format].filter((f): f is Format => f !== undefined);
  if (formats.some((f) => f !== 'esm' && f !== 'cjs')) {
    throw new BuildError({
      code: 'INVALID_FORMAT',
      step: 'config',
      message: 'Invalid format specified.',
      hint: 'Supported formats: "esm", "cjs".',
    });
  }

  const targets = Array.isArray(config.target) ? config.target : [config.target].filter((f): f is Target => f !== undefined);
  if (targets.some((t) => t !== 'bun' && t !== 'node')) {
    throw new BuildError({
      code: 'INVALID_TARGET',
      step: 'config',
      message: 'Invalid target specified.',
      hint: 'Supported targets: "bun", "node".',
    });
  }

  const entries = Array.isArray(config.entry) ? config.entry : [config.entry];
  if (entries.some((e) => !e || e.trim().length === 0)) {
    throw new BuildError({
      code: 'CONFIG_INVALID',
      step: 'config',
      message: "Invalid 'entry' in config.",
      hint: "Set 'entry' to a non-empty string or string[].",
    });
  }

  if (config.bin) {
    for (const [name, entry] of Object.entries(config.bin)) {
      if (!name || name.trim().length === 0 || !entry || entry.trim().length === 0) {
        throw new BuildError({
          code: 'CONFIG_INVALID',
          step: 'config',
          message: "Invalid 'bin' config.",
          hint: "Example: bin: { bunpack: 'src/cli.ts' }",
        });
      }
    }
  }
}
