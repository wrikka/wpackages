import { Effect as FunctionalEffect } from "@wts/functional";
import { Effect, Layer } from "@wts/functional";
import type { Effect as EffectType } from "@wts/functional";

export interface CommandResult {
	readonly exitCode: number;
	readonly stdout: string;
	readonly stderr: string;
}

export interface Command {
	readonly run: (
		file: string,
		args?: ReadonlyArray<string>,
		options?: { readonly cwd?: string; readonly env?: Readonly<Record<string, string | undefined>> },
	) => EffectType<CommandResult, Error, never>;
}

export const Command = FunctionalEffect.tag<Command>();

type ExecOptions = { readonly cwd?: string; readonly env?: Readonly<Record<string, string | undefined>> };

const readBunOutput = async (output: number | ReadableStream<Uint8Array> | undefined | null): Promise<string> => {
	if (output == null) {
		return "";
	}
	if (typeof output === "number") {
		return "";
	}
	return new Response(output).text();
};

const runWithBun = async (file: string, args: ReadonlyArray<string>, options: ExecOptions): Promise<CommandResult> => {
	const spawnOptions: Parameters<typeof Bun.spawn>[1] = {
		stderr: "pipe",
		stdout: "pipe",
		...(options.cwd ? { cwd: options.cwd } : {}),
		...(options.env
			? {
				env: Object.fromEntries(Object.entries(options.env).filter(([, v]) => v !== undefined)) as Record<
					string,
					string
				>,
			}
			: {}),
	};

	const proc = Bun.spawn([file, ...args], spawnOptions);

	const [stdout, stderr] = await Promise.all([
		readBunOutput(proc.stdout),
		readBunOutput(proc.stderr),
	]);

	const exitCode = await proc.exited;
	return { exitCode, stdout, stderr };
};

const runWithNode = async (file: string, args: ReadonlyArray<string>, options: ExecOptions): Promise<CommandResult> => {
	const { execFile } = await import("node:child_process");
	return new Promise((resolve) => {
		execFile(
			file,
			[...args],
			{
				cwd: options.cwd,
				env: options.env ? { ...process.env, ...options.env } : process.env,
				encoding: "utf8",
				maxBuffer: 1024 * 1024,
			},
			(err, stdout, stderr) => {
				if (err) {
					const exitCode = typeof (err as any).code === "number" ? (err as any).code : 1;
					resolve({ exitCode, stdout: String(stdout ?? ""), stderr: String(stderr ?? err.message ?? "") });
					return;
				}
				resolve({ exitCode: 0, stdout: String(stdout ?? ""), stderr: String(stderr ?? "") });
			},
		);
	});
};

const runCommand = (file: string, args: ReadonlyArray<string>, options: ExecOptions) => {
	if (typeof Bun !== "undefined" && typeof Bun.spawn === "function") {
		return runWithBun(file, args, options);
	}
	return runWithNode(file, args, options);
};

export const CommandLive = Layer.succeed(Command, {
	run: (file, args = [], options = {}) =>
		Effect.fromPromise(async () => {
			const result = await runCommand(file, args, options);
			if (result.exitCode !== 0) {
				throw new Error(result.stderr || `Command failed with exitCode=${result.exitCode}`);
			}
			return result;
		}),
});

export const run = (file: string, args?: ReadonlyArray<string>, options?: ExecOptions) =>
	Effect.gen(function*() {
		const svc = yield Effect.get(Command);
		return yield svc.run(file, args, options);
	});
