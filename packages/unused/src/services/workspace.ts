import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';

export type WorkspacePackage = {
	name: string;
	dir: string;
	packageJsonPath: string;
};

type RootPackageJson = {
	workspaces?: string[];
};

async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

export async function findMonorepoRoot(startDir: string): Promise<string> {
	let current = path.resolve(startDir);
	for (;;) {
		const pkgPath = path.join(current, 'package.json');
		if (await fileExists(pkgPath)) {
			const pkg = await fs.readFile(pkgPath, 'utf-8');
			const json = JSON.parse(pkg) as RootPackageJson;
			if (Array.isArray(json.workspaces) && json.workspaces.length > 0) {
				return current;
			}
		}
		const parent = path.dirname(current);
		if (parent === current) return path.resolve(startDir);
		current = parent;
	}
}

export async function listWorkspacePackages(monorepoRoot: string): Promise<WorkspacePackage[]> {
	const pkgPath = path.join(monorepoRoot, 'package.json');
	const pkg = await fs.readFile(pkgPath, 'utf-8');
	const root = JSON.parse(pkg) as RootPackageJson;
	const workspaces = root.workspaces ?? [];

	const includePatterns = workspaces.filter(p => !p.startsWith('!'));
	const excludePatterns = workspaces.filter(p => p.startsWith('!')).map(p => p.slice(1));

	const packageJsonMatches = new Set<string>();
	for (const pattern of includePatterns) {
		const matches = await glob(`${pattern}/package.json`, {
			cwd: monorepoRoot,
			ignore: ['**/node_modules/**', '**/dist/**', ...excludePatterns.map(p => `${p}/**`)],
			absolute: true,
			nodir: true,
		});
		matches.forEach(m => packageJsonMatches.add(path.resolve(m)));
	}

	const packages: WorkspacePackage[] = [];
	for (const absPkgJson of packageJsonMatches) {
		try {
			const text = await fs.readFile(absPkgJson, 'utf-8');
			const json = JSON.parse(text) as { name?: unknown };
			const name = typeof json.name === 'string' ? json.name : path.basename(path.dirname(absPkgJson));
			packages.push({
				name,
				dir: path.dirname(absPkgJson),
				packageJsonPath: absPkgJson,
			});
		} catch {
			// skip unreadable package.json
		}
	}

	packages.sort((a, b) => a.name.localeCompare(b.name));
	return packages;
}
