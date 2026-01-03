import { Context, Effect, Layer, Ref } from "effect";
import type { TaskSource } from "../types/index.js";

export class AppState extends Context.Tag("AppState")<AppState, {
	readonly currentTabIndex: Ref.Ref<number>;
	readonly taskSources: Ref.Ref<TaskSource[]>;
	readonly tabs: Effect.Effect<string[], never, never>;
	readonly currentTasks: Effect.Effect<TaskSource["tasks"], never, never>;
}>() {}

export const AppStateLive = Layer.effect(
	AppState,
	Effect.gen(function*() {
		const currentTabIndex = yield* Ref.make(0);
		const taskSources = yield* Ref.make<TaskSource[]>([]);

		const tabs = Effect.map(Ref.get(taskSources), sources => sources.map(ts => ts.source));

		const currentTasks = Effect.gen(function*() {
			const index = yield* Ref.get(currentTabIndex);
			const sources = yield* Ref.get(taskSources);
			return sources[index]?.tasks || [];
		});

		return AppState.of({
			currentTabIndex,
			taskSources,
			tabs,
			currentTasks,
		});
	}),
);
