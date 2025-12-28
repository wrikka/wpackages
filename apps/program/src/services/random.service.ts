import { Effect } from "@wts/functional";

export interface Random {
	readonly next: () => Effect<number, never, never>;
}

export const Random = Effect.tag<Random>();
