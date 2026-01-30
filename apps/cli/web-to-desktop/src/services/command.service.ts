import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export const runCommand = async (command: string, options: { cwd?: string } = {}) => {
  return await execAsync(command, options);
};
