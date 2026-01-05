import path from 'node:path';
import type { AnalysisResult, AnyAnalysisResult, PackageAnalysisResult, WorkspaceAnalysisResult } from '../types';

type SarifLog = {
	$schema: string;
	version: '2.1.0';
	runs: SarifRun[];
};

type SarifRun = {
	tool: {
		driver: {
			name: string;
			informationUri?: string;
			rules: SarifRule[];
		};
	};
	results: SarifResult[];
};

type SarifRule = {
	id: string;
	name: string;
	shortDescription: { text: string };
	helpUri?: string;
};

type SarifResult = {
	ruleId: string;
	level: 'error' | 'warning' | 'note';
	message: { text: string };
	locations?: Array<{
		physicalLocation: {
			artifactLocation: { uri: string };
		};
	}>;
	properties?: Record<string, unknown>;
};

const RULES: SarifRule[] = [
	{
		id: 'unused-file',
		name: 'Unused file',
		shortDescription: { text: 'File is not reachable from entrypoints' },
	},
	{
		id: 'unused-dependency',
		name: 'Unused dependency',
		shortDescription: { text: 'Dependency declared but not used' },
	},
	{
		id: 'unused-export',
		name: 'Unused export',
		shortDescription: { text: 'Exported symbol is not imported anywhere' },
	},
];

function isWorkspaceResult(result: AnyAnalysisResult): result is WorkspaceAnalysisResult {
	return (result as WorkspaceAnalysisResult).mode === 'workspace';
}

function toUri(rootCwd: string, filePath: string): string {
	return path.relative(rootCwd, filePath).replaceAll('\\', '/');
}

function buildResultsForSingle(result: AnalysisResult, rootCwd: string, packageName?: string): SarifResult[] {
	const results: SarifResult[] = [];

	for (const filePath of result.unusedFiles) {
		const item: SarifResult = {
			ruleId: 'unused-file',
			level: 'warning',
			message: { text: `Unused file: ${toUri(rootCwd, filePath)}` },
			locations: [
				{
					physicalLocation: {
						artifactLocation: { uri: toUri(rootCwd, filePath) },
					},
				},
			],
		};
		if (packageName) {
			item.properties = { package: packageName };
		}
		results.push(item);
	}

	for (const dep of result.unusedDependencies) {
		const item: SarifResult = {
			ruleId: 'unused-dependency',
			level: 'warning',
			message: { text: `Unused dependency: ${dep}` },
		};
		item.properties = packageName ? { package: packageName, dependency: dep } : { dependency: dep };
		results.push(item);
	}

	for (const [filePath, exports] of result.unusedExports.entries()) {
		for (const exp of exports) {
			const item: SarifResult = {
				ruleId: 'unused-export',
				level: 'warning',
				message: { text: `Unused export: ${exp}` },
				locations: [
					{
						physicalLocation: {
							artifactLocation: { uri: toUri(rootCwd, filePath) },
						},
					},
				],
			};
			item.properties = packageName ? { package: packageName, export: exp } : { export: exp };
			results.push(item);
		}
	}

	return results;
}

export function toSarifReport(result: AnyAnalysisResult, cwd: string): SarifLog {
	const run: SarifRun = {
		tool: {
			driver: {
				name: '@wpackages/unused',
				rules: RULES,
			},
		},
		results: [],
	};

	if (isWorkspaceResult(result)) {
		for (const pkg of result.packages) {
			run.results.push(...buildResultsForSingle(pkg as PackageAnalysisResult, pkg.cwd, pkg.packageName));
		}
	} else {
		run.results = buildResultsForSingle(result, cwd);
	}

	return {
		$schema: 'https://json.schemastore.org/sarif-2.1.0.json',
		version: '2.1.0',
		runs: [run],
	};
}
