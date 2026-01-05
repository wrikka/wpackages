import { createCoverageMap } from "istanbul-lib-coverage";
import { createInstrumenter } from "istanbul-lib-instrument";
import { createContext } from "istanbul-lib-report";
import { create as createReporter } from "istanbul-reports";

(globalThis as any).__coverage__ = {};

export class CoverageService {
	instrumenter = createInstrumenter({
		esModules: true,
		produceSourceMap: true,
	});

	instrumentCode(code: string, filename: string) {
		return this.instrumenter.instrumentSync(code, filename);
	}

	async report() {
		const map = createCoverageMap(globalThis.__coverage__);
		const context = createContext({ coverageMap: map });

		(["json", "lcov", "text"] as const).forEach(reporterName => {
			const reporter = createReporter(reporterName, { projectRoot: process.cwd() });
			reporter.execute(context);
		});
	}
}
