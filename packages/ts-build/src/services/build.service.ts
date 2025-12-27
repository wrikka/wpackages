import { rolldown } from 'rolldown';
import type { Result } from '../types/result';

// Note: Rolldown's watch mode is handled differently and will be implemented later.
export async function build(
  cliOptions: { watch?: boolean; entry: string; outDir: string }
): Promise<Result<void, string>> {
  try {
    const builder = await rolldown({
      input: cliOptions.entry,
      output: {
        dir: cliOptions.outDir,
        format: 'es',
      },
      // Rolldown doesn't handle d.ts generation natively yet.
      // This will be handled separately.
    });
    await builder.write();
    await builder.destroy();
    return { success: true, value: undefined };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
}
