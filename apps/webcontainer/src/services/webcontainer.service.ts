// import { PackageManagerService } from "package-manager"; // TODO: package-manager not available
// import { detectShell, TerminalService } from "terminal"; // TODO: terminal not available yet
import { Context, Effect, Layer } from "effect";

// TODO: Stub implementations until terminal and package-manager are available
const detectShell = () => "bash";
class TerminalService {
	run(_command: string, _options?: any) {
		return Promise.resolve({ exitCode: 0, stdout: "", stderr: "" });
	}
}
class PackageManagerService {
	build() {
		return Promise.resolve({ exitCode: 0, stdout: "", stderr: "", success: true, duration: 0 });
	}
	run(_script: string, _args?: readonly string[]) {
		return Promise.resolve({ exitCode: 0, stdout: "", stderr: "", success: true, duration: 0 });
	}
	test() {
		return Promise.resolve({ exitCode: 0, stdout: "", stderr: "", success: true, duration: 0 });
	}
	install(_packages?: readonly string[]) {
		return Promise.resolve({ exitCode: 0, stdout: "", stderr: "", success: true, duration: 0 });
	}
	uninstall(_packages: readonly string[]) {
		return Promise.resolve({ exitCode: 0, stdout: "", stderr: "", success: true, duration: 0 });
	}
	getType() {
		return "npm" as const;
	}
}
import type { ContainerConfig, ContainerInfo, ContainerStatus, ExecuteResult } from "../types";
import { generateContainerId, generateContainerName, mergeResourceLimits } from "../utils";

export class WebContainerService extends Context.Tag("WebContainerService")<
	WebContainerService,
	{
		readonly start: () => Effect.Effect<void, Error>;
		readonly stop: () => Effect.Effect<void, Error>;
		readonly execute: (command: string) => Effect.Effect<ExecuteResult, Error>;
		readonly install: (
			packages?: readonly string[],
		) => Effect.Effect<ExecuteResult, Error>;
		readonly uninstall: (
			packages: readonly string[],
		) => Effect.Effect<ExecuteResult, Error>;
		readonly runScript: (
			script: string,
			args?: readonly string[],
		) => Effect.Effect<ExecuteResult, Error>;
		readonly test: () => Effect.Effect<ExecuteResult, Error>;
		readonly build: () => Effect.Effect<ExecuteResult, Error>;
		readonly dev: () => Effect.Effect<ExecuteResult, Error>;
		readonly getInfo: () => ContainerInfo;
		readonly getStatus: () => ContainerStatus;
		readonly isRunning: () => boolean;
	}
>() {}

const make = (config: ContainerConfig) => {
	// TODO: Stub implementations - TerminalService and PackageManagerService not available
	const terminal = new TerminalService();
	const packageManager = new PackageManagerService();

	const id = generateContainerId();
	const name = config.name || generateContainerName();
	const shell = config.shell || detectShell();
	const resourceLimits = mergeResourceLimits(config.resourceLimits);
	const createdAt = Date.now();

	let status: ContainerStatus = "idle";
	let startedAt: number | undefined;
	let stoppedAt: number | undefined;

	const ensureRunning = (): Effect.Effect<void, Error> =>
		status === "running"
			? Effect.void
			: Effect.fail(
				new Error("Container is not running. Call start() first."),
			);

	return Effect.sync(() => ({
			build: () =>
				Effect.gen(function*() {
					yield* ensureRunning();
					const result = yield* Effect.promise(() => packageManager.build());
					return result;
				}),

			dev: () =>
				Effect.gen(function*() {
					yield* ensureRunning();
					const result = yield* Effect.promise(() => packageManager.run("dev"));
					return result;
				}),

			execute: (command: string) =>
				Effect.gen(function*() {
					yield* ensureRunning();
					const startTime = Date.now();
					const result = yield* Effect.promise(() =>
						terminal.run(command, {
							cwd: config.workdir,
							env: config.env,
							timeout: resourceLimits.timeout,
						}),
					);

					return {
						duration: Date.now() - startTime,
						exitCode: result.exitCode || 1,
						stderr: result.stderr,
						stdout: result.stdout,
						success: result.exitCode === 0,
					};
				}),

			getInfo: () => {
				const baseInfo = {
					createdAt,
					id,
					name,
					packageManager: packageManager.getType(),
					shell,
					status,
					workdir: config.workdir,
				};

				if (startedAt !== undefined && stoppedAt !== undefined) {
					return { ...baseInfo, startedAt, stoppedAt };
				}
				if (startedAt !== undefined) {
					return { ...baseInfo, startedAt };
				}
				if (stoppedAt !== undefined) {
					return { ...baseInfo, stoppedAt };
				}

				return baseInfo;
			},

			getStatus: () => status,

			install: (packages: readonly string[] = []) =>
				Effect.gen(function*() {
					yield* ensureRunning();
					const startTime = Date.now();
					const result = yield* Effect.promise(() => packageManager.install(packages));
					return { ...result, duration: Date.now() - startTime };
				}),

			isRunning: () => status === "running",

			runScript: (script: string, args: readonly string[] = []) =>
				Effect.gen(function*() {
					yield* ensureRunning();
					const startTime = Date.now();
					const result = yield* Effect.promise(() => packageManager.run(script, args));
					return { ...result, duration: Date.now() - startTime };
				}),
			start: () =>
				Effect.sync(() => {
					if (status === "running") {
						throw new Error("Container is already running");
					}
					status = "running";
					startedAt = Date.now();
				}),

			stop: () =>
				Effect.gen(function*() {
					if (status !== "running") {
						yield* Effect.fail(new Error("Container is not running"));
					}
					status = "stopped";
					stoppedAt = Date.now();
				}),

			test: () =>
				Effect.gen(function*() {
					yield* ensureRunning();
					const result = yield* Effect.promise(() => packageManager.test());
					return result;
				}),

			uninstall: (packages: readonly string[]) =>
				Effect.gen(function*() {
					yield* ensureRunning();
					const startTime = Date.now();
					const result = yield* Effect.promise(() => packageManager.uninstall(packages));
					return { ...result, duration: Date.now() - startTime };
				}),
		}));
};

export const WebContainerServiceLive = (config: ContainerConfig) =>
	Layer.effect(WebContainerService, make(config) as any); // Type assertion for Effect-TS compatibility
