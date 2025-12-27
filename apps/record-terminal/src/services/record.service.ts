import { execa } from 'execa';

export async function startRecording(filePath: string): Promise<void> {
  try {
    await execa('asciinema', ['rec', filePath, '--overwrite'], { stdio: 'inherit' });
  } catch (error) {
    if (error instanceof Error && 'exitCode' in error && error.exitCode === 127) {
      throw new Error('`asciinema` command not found. Please install it first.');
    }
    // Handle other errors or user cancellation
    throw new Error('Recording was cancelled or failed.');
  }
}
