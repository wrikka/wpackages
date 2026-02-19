import { execute } from "@wpackages/task-runner";
import { Context, Effect, Layer } from "effect";
import type { Task } from "../types";

export class TaskRunnerService extends Context.Tag("TaskRunnerService")<
	TaskRunnerService,
	{
		runTask: (task: Task) => Effect.Effect<void, Error>;
	}
>() {}

export const TaskRunnerLive = Layer.succeed(
	TaskRunnerService,
	TaskRunnerService.of({
		runTask: (task: Task) =>
			Effect.promise(async () => {
				const [command, ...args] = task.command.split(" ");
				await execute({
					command,
					args,
					cwd: task.cwd,
					stdout: "inherit",
					stderr: "inherit",
				});
			}),
	}),
);
