import { Effect, Layer } from "@wpackages/functional";
import { runWithBun, type ExecOptions } from "../internal/bun";
import { runWithNode } from "../internal/node";
import { Command } from "../types/Command";
import { CommandError } from "../error";

const runCommand = (file: string, args: ReadonlyArray<string>, options: ExecOptions) => {
	if (typeof Bun !== "undefined" && typeof Bun.spawn === "function") {
		return runWithBun(file, args, options);
	}
	return runWithNode(file, args, options);
};

export const CommandLive = Layer.succeed(Command, {
	run: (file, args = [], options = {}) =>
		Effect.tryPromise({
			try: () => runCommand(file, args, options),
			catch: (unknown) => new CommandError({ exitCode: 1, stderr: String(unknown) }),
		}).pipe(
			Effect.flatMap((result) => {
				if (result.exitCode !== 0) {
					return Effect.fail(new CommandError(result));
				}
				return Effect.succeed(result);
			}),
		),
});

export const run = (file: string, args?: ReadonlyArray<string>, options?: ExecOptions) =>
	Effect.gen(function*() {
		const svc = yield* Effect.get(Command);
		return yield* svc.run(file, args, options);
	});