import { describe, expect, it } from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { loadTsConfig } from './tsconfig-loader';

function toPosixPath(filePath: string): string {
	return filePath.replace(/\\/g, '/');
}

async function createTempDir(prefix: string): Promise<string> {
	return await fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe('loadTsConfig', () => {
	it('should parse tsconfig with comments and return compilerOptions', async () => {
		const dir = await createTempDir('wpackages-unused-');
		const tsconfigPath = path.join(dir, 'tsconfig.json');
		await fs.writeFile(
			tsconfigPath,
			`${JSON.stringify(
				{
					compilerOptions: {
						baseUrl: '.',
						paths: {
							'@/*': ['src/*'],
						},
					},
				},
				null,
				2,
			)}\n// trailing comment\n`,
			'utf-8',
		);

		const loaded = await loadTsConfig(dir);
		expect(loaded).not.toBeNull();
		expect(toPosixPath(loaded?.compilerOptions?.baseUrl ?? '')).toBe(toPosixPath(dir));
		expect(loaded?.compilerOptions?.paths).toEqual({ '@/*': ['src/*'] });
	});
});
