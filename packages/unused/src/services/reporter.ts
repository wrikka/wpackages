import path from 'node:path';
import fs from 'node:fs/promises';
import type { AnyAnalysisResult, AnalysisResult, WorkspaceAnalysisResult } from '../types';
import { toJsonReport, toWorkspaceJsonReport } from '../components/json-reporter';
import { toSarifReport } from '../components/sarif-reporter';

export type ReportFormat = 'text' | 'json' | 'sarif';

export interface ReportOptions {
    cwd: string;
    format?: ReportFormat;
    outputFile?: string;
}

function isWorkspaceResult(result: AnyAnalysisResult): result is WorkspaceAnalysisResult {
	return (result as WorkspaceAnalysisResult).mode === 'workspace';
}

function countIssues(result: AnalysisResult): number {
	const unusedExportCount = [...result.unusedExports.values()].reduce((acc, v) => acc + v.length, 0);
	return result.unusedFiles.length + result.unusedDependencies.length + unusedExportCount;
}

export function report(result: AnyAnalysisResult, options: ReportOptions): Promise<number> {
    const cwd = options.cwd;
    const format = options.format ?? 'text';
    let issueCount = 0;

    const renderText = (single: AnalysisResult, rootCwd: string) => {
        if (single.unusedFiles.length > 0) {
            console.log('\n--- Unused Files ---');
            single.unusedFiles.forEach((file: string) => {
                console.log(path.relative(rootCwd, file));
                issueCount++;
            });
        }

        if (single.unusedDependencies.length > 0) {
            console.log('\n--- Unused Dependencies ---');
            single.unusedDependencies.forEach((dep: string) => {
                console.log(dep);
                issueCount++;
            });
        }

        if (single.unusedExports.size > 0) {
            console.log('\n--- Unused Exports ---');
            for (const [filePath, exports] of single.unusedExports.entries()) {
                console.log(filePath);
                exports.forEach((exp: string) => {
                    console.log(`  - ${exp}`);
                    issueCount++;
                });
            }
        }
    };

    const writeOutput = async (content: string) => {
        if (options.outputFile) {
            await fs.writeFile(options.outputFile, content, 'utf-8');
        } else {
            console.log(content);
        }
    };

    return (async () => {
        if (format === 'sarif') {
			const sarif = JSON.stringify(toSarifReport(result, cwd), null, 2);
			await writeOutput(sarif);
			issueCount = isWorkspaceResult(result)
				? toWorkspaceJsonReport(result).summary.issues
				: toJsonReport(result, cwd).summary.issues;
		} else if (format === 'json') {
			if (isWorkspaceResult(result)) {
				const json = JSON.stringify(toWorkspaceJsonReport(result), null, 2);
				await writeOutput(json);
				issueCount = toWorkspaceJsonReport(result).summary.issues;
			} else {
				const json = JSON.stringify(toJsonReport(result, cwd), null, 2);
				await writeOutput(json);
				issueCount = toJsonReport(result, cwd).summary.issues;
			}
		} else {
			if (isWorkspaceResult(result)) {
				let total = 0;
				for (const pkg of result.packages) {
					console.log(`\n=== ${pkg.packageName} (${pkg.cwd}) ===`);
					const pkgIssues = countIssues(pkg);
					total += pkgIssues;
					renderText(pkg, pkg.cwd);
				}
				issueCount = total;
			} else {
				renderText(result, cwd);
			}
        }

        if (issueCount === 0) {
            if (format !== 'json') {
                console.log('\n✨ No unused files, dependencies, or exports found. Your project is clean!');
            }
            return 0;
        }

        if (format !== 'json') {
            console.log(`\nFound ${issueCount} total issues.`);
        }
        return 1;
    })();
}
