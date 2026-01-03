import type { TestResult } from './types';

// Basic color functions for console output
const red = (str: string) => `\x1b[31m${str}\x1b[0m`;
const green = (str: string) => `\x1b[32m${str}\x1b[0m`;
const dim = (str: string) => `\x1b[2m${str}\x1b[0m`;

export class ConsoleReporter {
	private results: TestResult[] = [];

	addResult(result: TestResult): void {
		this.results.push(result);
	}

	printSummary(): void {
		console.log('\n--- Test Summary ---');
		const passedCount = this.results.filter(r => r.status === 'passed').length;
		const failedCount = this.results.length - passedCount;

		this.results.forEach(result => {
			if (result.status === 'passed') {
				console.log(`${green('✓')} ${dim(result.suiteName + ' >')} ${result.testName}`);
			} else {
				console.log(`${red('✗')} ${dim(result.suiteName + ' >')} ${result.testName}`);
				if (result.error) {
					console.log(dim(result.error.stack || result.error.message));
				}
			}
		});

		console.log(`\nTests: ${green(passedCount + ' passed')}, ${failedCount > 0 ? red(failedCount + ' failed') : '0 failed'}`);
		console.log(`Total: ${this.results.length}`);
	}
}
