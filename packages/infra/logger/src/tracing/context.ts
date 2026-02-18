import { Context, Effect } from "effect";
import type { LogContext } from "../types";

export const LogContextTag = Context.GenericTag<LogContext>("@wpackages/logger/LogContext");

export const generateTraceId = (): string => `trace_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const withLogContext = (
	context: LogContext,
	effect: Effect.Effect<unknown>,
): Effect.Effect<unknown> => {
	return Effect.provideService(effect, LogContextTag, context) as Effect.Effect<unknown>;
};

export const getLogContext = Effect.flatMap(LogContextTag, (ctx) => Effect.succeed(ctx));
