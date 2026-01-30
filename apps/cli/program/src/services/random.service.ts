import { Context, Effect } from "effect";
import type { RandomGenerationError } from "../error";

export interface Random {
	readonly next: () => Effect.Effect<number, RandomGenerationError>;
}

export const Random = Context.GenericTag<Random>("@wpackages/program/Random");
