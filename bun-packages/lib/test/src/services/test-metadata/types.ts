export interface TestMetadata {
	name: string;
	description?: string;
	tags: string[];
	timeout?: number;
	retries?: number;
	slow?: boolean;
	skip?: boolean;
	skipReason?: string;
	only?: boolean;
	annotations: Record<string, any>;
}

export interface TestSuite {
	name: string;
	metadata: TestMetadata;
	tests: TestMetadata[];
	beforeEach?: TestMetadata;
	afterEach?: TestMetadata;
	beforeAll?: TestMetadata;
	afterAll?: TestMetadata;
}

export interface TagFilter {
	include?: string[];
	exclude?: string[];
}
