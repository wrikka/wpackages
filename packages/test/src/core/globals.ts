import { addSuite, getSuites } from './registry';
import type { TestSuite, TestCase, TestFunction } from './types';

let currentSuite: TestSuite | null = null;

function createSuite(name: string): TestSuite {
	return { name, tests: [], suites: [], beforeAllHooks: [], afterAllHooks: [] };
}

export function describe(name: string, fn: () => void): void {
	const parentSuite = currentSuite;
	const newSuite = createSuite(name);

	if (parentSuite) {
		parentSuite.suites.push(newSuite);
	} else {
		addSuite(newSuite);
	}

	currentSuite = newSuite;
	fn();
	currentSuite = parentSuite;
}

function addTest(name: string, fn: TestFunction): void {
	if (!currentSuite) {
		// Allow tests to be defined at the top level
		const defaultSuite = createSuite('default');
		addSuite(defaultSuite);
		currentSuite = defaultSuite;
	}
	const testCase: TestCase = { name, fn };
	currentSuite.tests.push(testCase);
}

export const it = addTest;
export const test = addTest;

export function beforeAll(fn: TestFunction): void {
	if (currentSuite) {
		currentSuite.beforeAllHooks.push(fn);
	}
}

export function afterAll(fn: TestFunction): void {
	if (currentSuite) {
		currentSuite.afterAllHooks.push(fn);
	}
}
