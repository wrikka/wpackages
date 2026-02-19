export interface TestFixture {
	readonly plugin: unknown;
	readonly api: unknown;
	readonly mockRegistry: Record<string, unknown>;
}

export interface TestCase {
	readonly name: string;
	readonly fn: (fixture: TestFixture) => Promise<void> | void;
	readonly timeout?: number;
	readonly skip?: boolean;
	readonly only?: boolean;
}

export interface TestSuite {
	readonly name: string;
	readonly beforeAll?: () => Promise<void> | void;
	readonly afterAll?: () => Promise<void> | void;
	readonly beforeEach?: () => Promise<void> | void;
	readonly afterEach?: () => Promise<void> | void;
	readonly tests: readonly TestCase[];
}

export interface TestResult {
	readonly suiteName: string;
	readonly testName: string;
	readonly status: "passed" | "failed" | "skipped";
	readonly duration: number;
	readonly error?: Error;
}

export interface TestRunResult {
	readonly passed: number;
	readonly failed: number;
	readonly skipped: number;
	readonly duration: number;
	readonly results: readonly TestResult[];
}

export interface TestingFramework {
	readonly createFixture: (plugin: unknown) => TestFixture;
	readonly describe: (name: string, fn: () => void) => void;
	readonly it: (name: string, fn: (fixture: TestFixture) => Promise<void> | void) => void;
	readonly beforeAll: (fn: () => Promise<void> | void) => void;
	readonly afterAll: (fn: () => Promise<void> | void) => void;
	readonly beforeEach: (fn: () => Promise<void> | void) => void;
	readonly afterEach: (fn: () => Promise<void> | void) => void;
	readonly run: () => Promise<TestRunResult>;
	readonly mock: <T>(name: string, implementation: T) => T;
	readonly spyOn: (obj: unknown, method: string) => unknown;
}
