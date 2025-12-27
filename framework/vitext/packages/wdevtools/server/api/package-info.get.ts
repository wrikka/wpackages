import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineEventHandler((_event) => {
  try {
    // This assumes the dev server is run from the root of the parent project.
    const packageJsonPath = resolve(process.cwd(), '../../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson;
  } catch (e) {
    return { error: 'Could not load package.json' };
  }
});
