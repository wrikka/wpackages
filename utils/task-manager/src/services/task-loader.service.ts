import { Effect, Either } from "effect";
import ini from "ini";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import toml from "toml";
import type { Task, TaskSource } from "../types";

// --- Effectful File Operations ---
const readFile = (path: string) =>
	Effect.tryPromise({
		try: () => fs.readFile(path, "utf-8"),
		catch: (e) => new Error(`Failed to read file: ${path}`, { cause: e }),
	});

const parseJson = (content: string) =>
	Effect.try({
		try: () => JSON.parse(content),
		catch: (e) => new Error("Failed to parse JSON", { cause: e }),
	});

const parseIni = (content: string) =>
	Effect.try({
		try: () => ini.parse(content),
		catch: (e) => new Error("Failed to parse INI", { cause: e }),
	});

const parseToml = (content: string) =>
	Effect.try({
		try: () => toml.parse(content),
		catch: (e) => new Error("Failed to parse TOML", { cause: e }),
	});

// --- Task Loading Logic ---
const loadTasksFromPath = (
	filePath: string,
): Effect.Effect<TaskSource, Error, never> =>
	Effect.gen(function*(_) {
		const resolvedPath = filePath.startsWith("~/")
			? path.join(os.homedir(), filePath.slice(2))
			: path.resolve(process.cwd(), filePath);

		const content = yield* _(readFile(resolvedPath));
		const source = path.basename(resolvedPath);
		let tasks: Task[] = [];

		if (source.endsWith(".json")) {
			const data = yield* _(parseJson(content));
			tasks = (data.tasks || []) as Task[];
		} else if (source.endsWith(".toml")) {
			const data = yield* _(parseToml(content));
			tasks = (data.tasks || []) as Task[];
		} else if (source.endsWith(".ini")) {
			const data = yield* _(parseIni(content));
			tasks = Object.values(data).map((task: unknown) => task as Task);
		}
		return { source, tasks };
	});

export const loadAllTasks = Effect.gen(function*(_) {
	const examplesPath = path.resolve(process.cwd(), "examples");
	const allFiles = yield* _(
		Effect.tryPromise({
			try: () => fs.readdir(examplesPath),
			catch: (_e) => new Error("Failed to read examples directory"),
		}),
	);

	const supportedFiles = ["wtask.config.json", "tasks.toml", "tasks.ini"];
	const taskFiles = allFiles.filter((file) => supportedFiles.includes(file));

	const tasksFromFiles = yield* _(
		Effect.all(
			taskFiles.map((file) => loadTasksFromPath(path.join(examplesPath, file))),
			{
				concurrency: "unbounded",
				mode: "either",
			},
		),
	);

	const successfulTasks = tasksFromFiles
		.filter(Either.isRight)
		.map((either) => either.right);

	return successfulTasks.filter((source) => source.tasks.length > 0);
});
