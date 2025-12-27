import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export const format = async (paths: string[]): Promise<{ stdout: string; stderr: string }> => {
    const command = `npx dprint fmt ${paths.join(' ')}`;
    return execAsync(command);
};
