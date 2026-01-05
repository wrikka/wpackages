import { describe, expect, it } from 'bun:test';
import path from 'node:path';
import { toSarifReport } from './sarif-reporter';
import type { AnalysisResult } from './types';

describe('toSarifReport', () => {
	it('should generate a valid SARIF skeleton for single result', () => {
		const cwd = process.cwd();
		const result: AnalysisResult = {
			unusedFiles: [path.join(cwd, 'src', 'a.ts')],
			unusedDependencies: ['left-pad'],
			unusedExports: new Map([[path.join(cwd, 'src', 'b.ts'), ['foo']]]),
		};

		const sarif = toSarifReport(result, cwd);
		expect(sarif.version).toBe('2.1.0');
		expect(sarif.$schema).toContain('sarif-2.1.0');
		expect(sarif.runs.length).toBe(1);
		expect(sarif.runs[0]?.results.length).toBeGreaterThan(0);

		const ruleIds = new Set(sarif.runs[0]!.results.map(r => r.ruleId));
		expect(ruleIds.has('unused-file')).toBe(true);
		expect(ruleIds.has('unused-dependency')).toBe(true);
		expect(ruleIds.has('unused-export')).toBe(true);
	});
});
