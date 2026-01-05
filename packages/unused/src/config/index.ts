import type { AnalyzeOptions } from '../types';

export type UnusedConfig = AnalyzeOptions & Record<string, unknown> & {
	format?: 'text' | 'json' | 'sarif';
	output?: string;
	workspace?: boolean;
	baseline?: string;
	updateBaseline?: boolean;
	cache?: boolean;
	cacheFile?: string;
	ignoreUnusedFiles?: string[];
	ignoreExports?: string[];
	ignoreDependencies?: string[];
};

export const defaultUnusedConfig: UnusedConfig = {
	cwd: process.cwd(),
	entrypoints: [],
	ignore: [],
	format: 'text',
	workspace: false,
	updateBaseline: false,
	cache: true,
	ignoreUnusedFiles: [],
	ignoreExports: [],
	ignoreDependencies: [],
};
