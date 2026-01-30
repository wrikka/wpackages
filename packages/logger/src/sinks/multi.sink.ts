import { Effect } from "effect";
import type { LogSink } from "../types";

export const createMultiSink = (sinks: ReadonlyArray<LogSink>): LogSink => {
	return (entry) => Effect.all(sinks.map((sink) => sink(entry)), { concurrency: "unbounded" });
};
