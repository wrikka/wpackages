export interface PropertyOptions {
	numRuns?: number;
	timeout?: number;
	seed?: number;
	path?: "shrink" | "full";
}

export interface PropertyResult {
	passed: boolean;
	numRuns: number;
	failed?: {
		input: any;
		error: Error;
		shrunk?: any;
	};
	duration: number;
}
