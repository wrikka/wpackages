export type TestFunction = () => void | Promise<void>;

export interface TestCase {
	name: string;
	fn: TestFunction;
}

export interface TestSuite {
	name: string;
	tests: TestCase[];
	suites: TestSuite[];
	beforeAllHooks: TestFunction[];
	afterAllHooks: TestFunction[];
}
