import { exec } from 'child_process';
import { promisify } from 'util';
import type { Result } from '../types/result';

const execAsync = promisify(exec);

export async function generateDts(outDir: string): Promise<Result<void, string>> {
  try {
    // Using tsc to generate declaration files
    const command = `tsc --emitDeclarationOnly --outDir ${outDir}`;
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(), // Ensure it runs in the correct directory
    });

    if (stderr) {
      return { success: false, error: stderr };
    }

    return { success: true, value: undefined };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during .d.ts generation';
    return { success: false, error: errorMessage };
  }
}
