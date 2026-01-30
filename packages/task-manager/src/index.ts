import { Effect } from "effect";
import { main } from "./app";

// Use Effect.scoped to create a scope for the application, then run it.
// This ensures that resources (like the terminal) are properly managed.
const runnable = Effect.scoped(main);

Effect.runFork(runnable);
