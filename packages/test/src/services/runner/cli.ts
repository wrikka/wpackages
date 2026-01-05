export interface CliOptions {
	watch: boolean;
	coverage: boolean;
	updateSnapshots: boolean;
	testNamePattern?: string;
	shard?: string;
	timeoutMs?: number;
	retries?: number;
}

function getArgValue(args: string[], key: string): string | undefined {
	const index = args.indexOf(key);
	if (index === -1) return;
	return args[index + 1];
}

export function parseCliOptions(): CliOptions {
	const args = process.argv.slice(2);
	const timeoutValue = getArgValue(args, "--timeout-ms");
	const retriesValue = getArgValue(args, "--retries");
	return {
		watch: args.includes("--watch"),
		coverage: args.includes("--coverage"),
		updateSnapshots: args.includes("-u") || args.includes("--update-snapshots"),
		testNamePattern: getArgValue(args, "--testNamePattern") ?? getArgValue(args, "--test-name-pattern"),
		shard: getArgValue(args, "--shard"),
		timeoutMs: timeoutValue ? Number(timeoutValue) : undefined,
		retries: retriesValue ? Number(retriesValue) : undefined,
	};
}
