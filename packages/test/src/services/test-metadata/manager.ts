import type { TagFilter, TestMetadata, TestSuite } from "./types";

export class TestMetadataManager {
	private suites = new Map<string, TestSuite>();
	private globalTags = new Set<string>();
	private tagHierarchy = new Map<string, string[]>(); // parent -> children

	// Register test suite with metadata
	public registerSuite(name: string, metadata: Partial<TestMetadata> = {}): TestSuite {
		const suite: TestSuite = {
			name,
			metadata: {
				name,
				tags: [],
				annotations: {},
				...metadata,
			},
			tests: [],
		};

		this.suites.set(name, suite);

		// Track global tags
		suite.metadata.tags.forEach((tag) => this.globalTags.add(tag));

		return suite;
	}

	// Register test with metadata
	public registerTest(
		suiteName: string,
		testName: string,
		metadata: Partial<TestMetadata> = {},
	): TestMetadata {
		const suite = this.suites.get(suiteName);
		if (!suite) {
			throw new Error(`Test suite "${suiteName}" not found`);
		}

		const test: TestMetadata = {
			name: testName,
			tags: [],
			annotations: {},
			...metadata,
		};

		suite.tests.push(test);

		// Track global tags
		test.tags.forEach((tag) => this.globalTags.add(tag));

		return test;
	}

	// Add tags to test or suite
	public addTags(targetName: string, tags: string[], isSuite = false): void {
		if (isSuite) {
			const suite = this.suites.get(targetName);
			if (suite) {
				suite.metadata.tags.push(...tags);
				tags.forEach((tag) => this.globalTags.add(tag));
			}
		} else {
			// Find test across all suites
			for (const suite of this.suites.values()) {
				const test = suite.tests.find((t) => t.name === targetName);
				if (test) {
					test.tags.push(...tags);
					tags.forEach((tag) => this.globalTags.add(tag));
					break;
				}
			}
		}
	}

	// Add annotation to test or suite
	public addAnnotation(
		targetName: string,
		key: string,
		value: any,
		isSuite = false,
	): void {
		if (isSuite) {
			const suite = this.suites.get(targetName);
			if (suite) {
				suite.metadata.annotations[key] = value;
			}
		} else {
			// Find test across all suites
			for (const suite of this.suites.values()) {
				const test = suite.tests.find((t) => t.name === targetName);
				if (test) {
					test.annotations[key] = value;
					break;
				}
			}
		}
	}

	// Mark test as slow
	public markSlow(testName: string, threshold = 1000): void {
		for (const suite of this.suites.values()) {
			const test = suite.tests.find((t) => t.name === testName);
			if (test) {
				test.slow = true;
				test.timeout = Math.max(test.timeout || 0, threshold);
				if (!test.tags.includes("slow")) {
					test.tags.push("slow");
				}
				break;
			}
		}
	}

	// Skip test with reason
	public skipTest(testName: string, reason?: string): void {
		for (const suite of this.suites.values()) {
			const test = suite.tests.find((t) => t.name === testName);
			if (test) {
				test.skip = true;
				test.skipReason = reason || "Skipped";
				if (!test.tags.includes("skip")) {
					test.tags.push("skip");
				}
				break;
			}
		}
	}

	// Mark test as only (run only this test)
	public markOnly(testName: string): void {
		// Clear all other only flags first
		for (const suite of this.suites.values()) {
			suite.tests.forEach((test) => {
				test.only = false;
			});
		}

		// Set only flag on specified test
		for (const suite of this.suites.values()) {
			const test = suite.tests.find((t) => t.name === testName);
			if (test) {
				test.only = true;
				break;
			}
		}
	}

	// Set up tag hierarchy (parent -> children)
	public setTagHierarchy(parent: string, children: string[]): void {
		this.tagHierarchy.set(parent, children);
	}

	// Get all tags
	public getAllTags(): string[] {
		return Array.from(this.globalTags).sort();
	}

	// Get tag statistics
	public getTagStats(): Record<string, { count: number; suites: string[]; tests: string[] }> {
		const stats: Record<string, { count: number; suites: string[]; tests: string[] }> = {};

		for (const tag of this.globalTags) {
			stats[tag] = { count: 0, suites: [], tests: [] };
		}

		for (const suite of this.suites.values()) {
			for (const tag of suite.metadata.tags) {
				if (stats[tag]) {
					stats[tag].suites.push(suite.name);
					stats[tag].count++;
				}
			}

			for (const test of suite.tests) {
				for (const tag of test.tags) {
					if (stats[tag]) {
						stats[tag].tests.push(test.name);
						stats[tag].count++;
					}
				}
			}
		}

		return stats;
	}

	// Filter tests by tags
	public filterTests(filter: TagFilter): TestSuite[] {
		const filteredSuites: TestSuite[] = [];

		for (const suite of this.suites.values()) {
			const filteredSuite: TestSuite = {
				...suite,
				tests: this.filterTestsByTags(suite.tests, filter),
			};

			// Include suite if it has matching tests or if suite itself matches
			if (filteredSuite.tests.length > 0 || this.matchesTags(suite.metadata.tags, filter)) {
				filteredSuites.push(filteredSuite);
			}
		}

		return filteredSuites;
	}

	// Get tests to run (respecting only/skip flags)
	public getTestsToRun(): TestSuite[] {
		const onlyTests: TestMetadata[] = [];
		const regularTests: TestMetadata[] = [];

		for (const suite of this.suites.values()) {
			for (const test of suite.tests) {
				if (test.only) {
					onlyTests.push(test);
				} else if (!test.skip) {
					regularTests.push(test);
				}
			}
		}

		// If there are only tests, run only those
		if (onlyTests.length > 0) {
			return this.groupTestsBySuite(onlyTests);
		}

		// Otherwise run regular tests
		return this.groupTestsBySuite(regularTests);
	}

	// Get slow tests
	public getSlowTests(): TestSuite[] {
		const slowSuites: TestSuite[] = [];

		for (const suite of this.suites.values()) {
			const slowTests = suite.tests.filter((test) => test.slow || test.tags.includes("slow"));
			if (slowTests.length > 0) {
				slowSuites.push({
					...suite,
					tests: slowTests,
				});
			}
		}

		return slowSuites;
	}

	// Get skipped tests
	public getSkippedTests(): TestSuite[] {
		const skippedSuites: TestSuite[] = [];

		for (const suite of this.suites.values()) {
			const skippedTests = suite.tests.filter(
				(test) => test.skip || test.tags.includes("skip"),
			);
			if (skippedTests.length > 0) {
				skippedSuites.push({
					...suite,
					tests: skippedTests,
				});
			}
		}

		return skippedSuites;
	}

	// Export metadata
	public exportMetadata(): any {
		return {
			suites: Array.from(this.suites.entries()).map(([name, suite]) => ({
				name,
				metadata: suite.metadata,
				tests: suite.tests,
				beforeEach: suite.beforeEach,
				afterEach: suite.afterEach,
				beforeAll: suite.beforeAll,
				afterAll: suite.afterAll,
			})),
			globalTags: this.getAllTags(),
			tagHierarchy: Object.fromEntries(this.tagHierarchy),
		};
	}

	// Import metadata
	public importMetadata(data: any): void {
		this.suites.clear();
		this.globalTags.clear();
		this.tagHierarchy.clear();

		if (data.suites) {
			for (const suiteData of data.suites) {
				const suite = this.registerSuite(suiteData.name, suiteData.metadata);
				suite.tests = suiteData.tests || [];
				suite.beforeEach = suiteData.beforeEach;
				suite.afterEach = suiteData.afterEach;
				suite.beforeAll = suiteData.beforeAll;
				suite.afterAll = suiteData.afterAll;
			}
		}

		if (data.tagHierarchy) {
			for (const [parent, children] of Object.entries(data.tagHierarchy)) {
				this.setTagHierarchy(parent, children as string[]);
			}
		}
	}

	// Clear all metadata
	public clear(): void {
		this.suites.clear();
		this.globalTags.clear();
		this.tagHierarchy.clear();
	}

	private filterTestsByTags(tests: TestMetadata[], filter: TagFilter): TestMetadata[] {
		return tests.filter((test) => this.matchesTags(test.tags, filter));
	}

	private matchesTags(tags: string[], filter: TagFilter): boolean {
		// If no include/exclude specified, match all
		if (!filter.include?.length && !filter.exclude?.length) {
			return true;
		}

		// Check includes
		if (filter.include?.length) {
			const hasIncludeTag = filter.include.some(
				(tag) => tags.includes(tag) || this.hasChildTag(tags, tag),
			);
			if (!hasIncludeTag) {
				return false;
			}
		}

		// Check excludes
		if (filter.exclude?.length) {
			const hasExcludeTag = filter.exclude.some(
				(tag) => tags.includes(tag) || this.hasChildTag(tags, tag),
			);
			if (hasExcludeTag) {
				return false;
			}
		}

		return true;
	}

	private hasChildTag(tags: string[], parentTag: string): boolean {
		const children = this.tagHierarchy.get(parentTag) || [];
		return children.some((child) => tags.includes(child) || this.hasChildTag(tags, child));
	}

	private groupTestsBySuite(tests: TestMetadata[]): TestSuite[] {
		const suiteMap = new Map<string, TestMetadata[]>();

		for (const test of tests) {
			// Find which suite this test belongs to
			for (const suite of this.suites.values()) {
				if (suite.tests.includes(test)) {
					if (!suiteMap.has(suite.name)) {
						suiteMap.set(suite.name, []);
					}
					suiteMap.get(suite.name)!.push(test);
					break;
				}
			}
		}

		return Array.from(suiteMap.entries()).map(([name, tests]) => ({
			name,
			metadata: this.suites.get(name)?.metadata || { name, tags: [], annotations: {} },
			tests,
		}));
	}
}
