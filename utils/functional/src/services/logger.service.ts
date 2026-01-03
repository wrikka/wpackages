import { Effect } from 'effect';

export const log = (message: string): Effect.Effect<void, never> =>
  Effect.sync(() => console.log(message));
