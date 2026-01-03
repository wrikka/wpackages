import type { CommandResult } from "../types/Command";

export type ExecOptions = { readonly cwd?: string; readonly env?: Readonly<Record<string, string | undefined>> };

const readBunOutput = async (output: number | ReadableStream<Uint8Array> | undefined | null): Promise<string> => {
	if (output == null) {
		return "";
	}
	if (typeof output === "number") {
		return "";
	}
	return new Response(output).text();
};

export const runWithBun = async (file: string, args: ReadonlyArray<string>, options: ExecOptions): Promise<CommandResult> => {
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