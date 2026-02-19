export interface PromptSnapshot {
	type: string;
	props: Record<string, unknown>;
	state: Record<string, unknown>;
	output: string;
	timestamp: number;
}

export interface TestOptions {
	autoSubmit?: boolean;
	submitValue?: unknown;
	simulateInput?: string[];
	simulateKeys?: string[];
	delay?: number;
}

export interface TestResult {
	passed: boolean;
	snapshots: PromptSnapshot[];
	errors: Error[];
	duration: number;
}

export interface PromptTester {
	createSnapshot: () => PromptSnapshot;
	restoreSnapshot: (snapshot: PromptSnapshot) => void;
	simulateInput: (input: string) => void;
	simulateKey: (key: string) => void;
	runTest: (options: TestOptions) => Promise<TestResult>;
}
