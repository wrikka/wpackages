import { Context, Effect, Layer, Ref } from "effect";
import type { Task } from "../types";
import { fuzzySearch } from "../utils/fuzzy-search";

export class FzfState extends Context.Tag("FzfState")<FzfState, {
	readonly query: Ref.Ref<string>;
	readonly selectedIndex: Ref.Ref<number>;
	readonly items: Ref.Ref<Task[]>;
	readonly results: Effect.Effect<Task[], never, never>;
}>() {}

export const FzfStateLive = Layer.effect(
	FzfState,
	Effect.gen(function*() {
		const query = yield* Ref.make("");
		const selectedIndex = yield* Ref.make(0);
		const items = yield* Ref.make<Task[]>([]);

		const results = Effect.gen(function*() {
			const q = yield* Ref.get(query);
			const i = yield* Ref.get(items);
			return fuzzySearch(q, i, { keys: ["name", "command"] });
		});

		return FzfState.of({
			query,
			selectedIndex,
			items,
			results,
		});
	}),
);
