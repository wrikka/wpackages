import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { findPackageJsons, readPackageJson } from './file.util';

const TEST_DIR = join(import.meta.dir, 'test_temp_dir');

beforeAll(async () => {
  await mkdir(TEST_DIR, { recursive: true });
  // Structure:
  // - test_temp_dir/
  //   - package.json
  //   - projectA/
  //     - package.json
  //   - projectB/
  //     - node_modules/
  //       - dep1/
  //         - package.json
  await writeFile(join(TEST_DIR, 'package.json'), JSON.stringify({ name: 'root' }));
  await mkdir(join(TEST_DIR, 'projectA'));
  await writeFile(join(TEST_DIR, 'projectA', 'package.json'), JSON.stringify({ name: 'projectA' }));
  await mkdir(join(TEST_DIR, 'projectB', 'node_modules', 'dep1'), { recursive: true });
  await writeFile(join(TEST_DIR, 'projectB', 'node_modules', 'dep1', 'package.json'), JSON.stringify({ name: 'dep1' }));
});

afterAll(async () => {
  await rm(TEST_DIR, { recursive: true, force: true });
});

describe('file.util', () => {
  it('should find all package.json files excluding nested node_modules', async () => {
    const packageJsons = await findPackageJsons(TEST_DIR);
    expect(packageJsons.length).toBe(2);
    const names = await Promise.all(packageJsons.map(p => readPackageJson(p).then(pkg => pkg.name)));
    expect(names).toContain('root');
    expect(names).toContain('projectA');
    expect(names).not.toContain('dep1');
  });

  it('should read a package.json file correctly', async () => {
    const rootPkgPath = join(TEST_DIR, 'package.json');
    const pkg = await readPackageJson(rootPkgPath);
    expect(pkg.name).toBe('root');
  });
});
