import { describe, expect, it } from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { DependencyGraph, AnalyzeOptions, FileNode } from './types';
import { analyzeGraph } from './analyzer';

function createMockGraph(cwd: string, files: Record<string, Partial<FileNode>>): DependencyGraph {
	const graph: DependencyGraph = new Map();
	for (const [relPath, partialNode] of Object.entries(files)) {
		const absPath = path.resolve(cwd, relPath);
		graph.set(absPath, {
			path: absPath,
			imports: [],
			reExports: [],
			exports: new Set(),
			...partialNode,
		});
	}
	return graph;
}

async function createTempProjectDir(): Promise<string> {
	const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'wpackages-unused-analyzer-'));
	await fs.writeFile(
		path.join(cwd, 'package.json'),
		JSON.stringify({ name: 'tmp', version: '0.0.0', dependencies: {}, devDependencies: {} }, null, 2),
		'utf-8',
	);
	return cwd;
}

describe('analyzeGraph', () => {
	it('should handle named re-export chains', async () => {
		const cwd = await createTempProjectDir();
		const graph = createMockGraph(cwd, {
			'entry.ts': { imports: [{ module: './a', specifiers: new Set(['foo']) }] },
			'a.ts': {
				reExports: [{ module: './b', exportAll: false, specifiers: new Map([['foo', 'foo']]) }],
				exports: new Set(['foo']),
			},
			'b.ts': { exports: new Set(['foo']) },
		});
		const options: AnalyzeOptions = { cwd, entrypoints: ['entry.ts'], ignore: [] };
		const result = await analyzeGraph(graph, options, []);
		expect(result.unusedFiles).toEqual([]);
		expect(Object.fromEntries(result.unusedExports.entries())).toEqual({});
	});

	it('should handle namespace re-exports', async () => {
		const cwd = await createTempProjectDir();
		const graph = createMockGraph(cwd, {
			'entry.ts': { imports: [{ module: './a', specifiers: new Set(['foo']) }] },
			'a.ts': {
				reExports: [{ module: './b', exportAll: true, specifiers: new Map() }],
			},
			'b.ts': { exports: new Set(['foo', 'bar']) },
		});
		const options: AnalyzeOptions = { cwd, entrypoints: ['entry.ts'], ignore: [] };
		const result = await analyzeGraph(graph, options, []);
		expect(result.unusedFiles).toEqual([]);
		expect(Object.fromEntries(result.unusedExports.entries())).toEqual({ 'b.ts': ['bar'] });
	});

	it('should apply ignore rules for files/exports/dependencies', async () => {
		const cwd = await createTempProjectDir();
		const graph = createMockGraph(cwd, {
			'entry.ts': { imports: [{ module: './used', specifiers: new Set(['default']) }] },
			'used.ts': { exports: new Set(['default']) },
			'ignored-file.ts': { exports: new Set(['x']) },
			'unused.ts': { exports: new Set(['keep', 'ignored']) },
		});

		const options: AnalyzeOptions = {
			cwd,
			entrypoints: ['entry.ts'],
			ignore: [],
			ignoreUnusedFiles: ['ignored-*.ts'],
			ignoreExports: ['ignored'],
			ignoreDependencies: ['left-pad'],
		};

		const result = await analyzeGraph(graph, options, []);
		// ignored-file.ts should be removed from unusedFiles
		expect(result.unusedFiles.map(f => path.basename(f))).toEqual(['unused.ts']);
		// 'ignored' export should be removed
		expect(Object.fromEntries(result.unusedExports.entries())).toEqual({ 'unused.ts': ['keep'] });
		// ignoreDependencies should not throw / should filter if present
		expect(result.unusedDependencies.includes('left-pad')).toBe(false);
	});
});
