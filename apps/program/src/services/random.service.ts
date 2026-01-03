import type { RandomGenerationError } from "../error";
import { Effect } from "../lib/functional";

export interface Random {
	readonly next: () => Effect<number, RandomGenerationError, never>;
}

export const Random = Effect.tag<Random>("Random");
