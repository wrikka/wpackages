import type {
	TestFixture,
	TestResult,
	TestRunResult,
	TestSuite,
	TestCase,
	TestingFramework,
} from "../types/testing.types";

export const createTestingFramework = (): TestingFramework => {
	let currentFixture: TestFixture | null = null;
	let suites: TestSuite[] = [];
	let currentSuite: TestSuite | null = null;

	const createFixture = (plugin: unknown): TestFixture => {
		currentFixture = {
			plugin,
			api: {},
			mockRegistry: {},
		};
		return currentFixture;
	};

	const describe = (name: string, fn: () => void): void => {
		const suite: TestSuite = {
			name,
			tests: [],
		};
		const prevSuite = currentSuite;
		currentSuite = suite;
		fn();
		suites.push(suite);
		currentSuite = prevSuite;
	};

	const it = (name: string, fn: (fixture: TestFixture) => Promise<void> | void): void => {
		if (!currentSuite) {
			throw new Error("Test case must be inside a describe block");
		}

		const test: TestCase = {
			name,
			fn,
			timeout: 5000,
			skip: false,
			only: false,
		};

		currentSuite.tests = [...currentSuite.tests, test];
	};

	const beforeAll = (fn: () => Promise<void> | void): void => {
		if (currentSuite) {
			currentSuite.beforeAll = fn;
		}
	};

	const afterAll = (fn: () => Promise<void> | void): void => {
		if (currentSuite) {
			currentSuite.afterAll = fn;
		}
	};

	const beforeEach = (fn: () => Promise<void> | void): void => {
		if (currentSuite) {
			currentSuite.beforeEach = fn;
		}
	};

	const afterEach = (fn: () => Promise<void> | void): void => {
		if (currentSuite) {
			currentSuite.afterEach = fn;
		}
	};

	const run = async (): Promise<TestRunResult> => {
		const results: TestResult[] = [];
		let passed = 0;
		let failed = 0;
		let skipped = 0;
		let totalDuration = 0;

		for (const suite of suites) {
			if (suite.beforeAll) {
				await suite.beforeAll();
			}

			for (const test of suite.tests) {
				const startTime = Date.now();

				if (test.skip) {
					skipped++;
					results.push({
						suiteName: suite.name,
						testName: test.name,
						status: "skipped",
						duration: 0,
					});
					continue;
				}

				try {
					if (suite.beforeEach) {
						await suite.beforeEach();
					}

					if (currentFixture) {
						await test.fn(currentFixture);
					} else {
						await test.fn({
							plugin: null,
							api: {},
							mockRegistry: {},
						});
					}

					if (suite.afterEach) {
						await suite.afterEach();
					}

					passed++;
					results.push({
						suiteName: suite.name,
						testName: test.name,
						status: "passed",
						duration: Date.now() - startTime,
					});
				} catch (error) {
					failed++;
					results.push({
						suiteName: suite.name,
						testName: test.name,
						status: "failed",
						duration: Date.now() - startTime,
						error: error instanceof Error ? error : new Error(String(error)),
					});
				}

				totalDuration += Date.now() - startTime;
			}

			if (suite.afterAll) {
				await suite.afterAll();
			}
		}

		return {
			passed,
			failed,
			skipped,
			duration: totalDuration,
			results: Object.freeze(results),
		};
	};

	const mock = <T>(_name: string, implementation: T): T => {
		return implementation;
	};

	const spyOn = (_obj: unknown, _method: string): unknown => {
		return {
			calls: [],
		};
	};

	return Object.freeze({
		createFixture,
		describe,
		it,
		beforeAll,
		afterAll,
		beforeEach,
		afterEach,
		run,
		mock,
		spyOn,
	});
};
