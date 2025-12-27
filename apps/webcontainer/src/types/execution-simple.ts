export type ExecuteResult = {
	readonly success: boolean;
	readonly stdout: string;
	readonly stderr: string;
	readonly exitCode: number;
	readonly duration: number;
};

export type ProcessInfo = {
	readonly pid: number;
	readonly command: string;
	readonly status: "running" | "stopped";
	readonly startedAt: number;
};
