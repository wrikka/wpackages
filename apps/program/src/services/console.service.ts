import { Effect } from "@wts/functional";

export interface Console {
  readonly log: (message: string) => Effect<void, never, never>;
}

export const Console = Effect.tag<Console>();
