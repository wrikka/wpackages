import { spawn } from "node:child_process";
import type { SpawnResult } from "../types/formatter";

export class ProcessError extends Error {
	constructor(
		message: string,
		public stdout: string,
		public stderr: string,
		public exitCode: number,
	) {
		super(message);
		this.name = "ProcessError";
	}
}

export const spawnAsync = (
	command: string,
	args: string[],
	opts: { cwd?: string } = {},
): Promise<SpawnResult> =>
	new Promise((resolvePromise, rejectPromise) => {
		const child = spawn(command, args, {
			cwd: opts.cwd,
			stdio: ["ignore", "pipe", "pipe"],
			windowsHide: true,
		});

		let stdout = "";
		let stderr = "";

		child.stdout?.on("data", (buf: Buffer) => {
			stdout += buf.toString("utf8");
		});
		child.stderr?.on("data", (buf: Buffer) => {
			stderr += buf.toString("utf8");
		});

		child.on("error", rejectPromise);
		child.on("close", (exitCode) => {
			resolvePromise({
				stdout,
				stderr,
				exitCode: exitCode ?? 0,
			});
		});
	});
