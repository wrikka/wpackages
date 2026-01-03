import { getSuites, clearSuites } from './registry';
import type { TestSuite } from './types';
import { ConsoleReporter } from '../reporter/console';

async function runSuite(suite: TestSuite, reporter: ConsoleReporter): Promise<void> {
	// Run beforeAll hooks
	for (const hook of suite.beforeAllHooks) {
		await hook();
	}

	// Run tests in the current suite
	for (const test of suite.tests) {
		try {
			await test.fn();
			reporter.addResult({ suiteName: suite.name, testName: test.name, status: 'passed' });
		} catch (error) {
			const testError = error instanceof Error ? error : new Error(String(error));
			reporter.addResult({ suiteName: suite.name, testName: test.name, status: 'failed', error: testError });
		}
	}

	// Run nested suites
	for (const nestedSuite of suite.suites) {
		await runSuite(nestedSuite, reporter);
	}

	// Run afterAll hooks
	for (const hook of suite.afterAllHooks) {
		await hook();
	}
}

export async function runTests(): Promise<void> {
	const reporter = new ConsoleReporter();
	const suites = getSuites();

	for (const suite of suites) {
		await runSuite(suite, reporter);
	}

	reporter.printSummary();
	clearSuites();
}
