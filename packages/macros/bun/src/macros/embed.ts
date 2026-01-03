import { macro } from 'bun';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export const embed = macro((filePath: string) => {
  const absolutePath = resolve(import.meta.dir, '..', filePath);
  try {
    const content = readFileSync(absolutePath, 'utf-8');
    return JSON.stringify(content);
  } catch (error) {
    throw new Error(`Failed to read file at "${absolutePath}": ${error}`);
  }
});
