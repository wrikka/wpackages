import { Context, Effect } from "effect";
import type { LogContext, LogMeta } from "../types";

export const LogContextTag = Context.GenericTag<LogContext>("@wpackages/logger/LogContext");

export const generateTraceId = (): string => `trace_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const withLogContext = <A, E>(
	context: LogContext,
	effect: Effect.Effect<A, E>,
): Effect.Effect<A, E> => {
	return Effect.provideService(effect, LogContextTag, context);
};

export const withBaggage = <A, E>(baggage: LogMeta, effect: Effect.Effect<A, E>): Effect.Effect<A, E> => {
	return Effect.flatMap(
		LogContextTag,
		(currentContext) => {
			const newContext: LogContext = {
				...currentContext,
				baggage: { ...currentContext.baggage, ...baggage },
			};
			return Effect.provideService(effect, LogContextTag, newContext);
		},
		{ onNone: () => withLogContext({ baggage }, effect) },
	);
};

export const getLogContext = Effect.flatMap(LogContextTag, (ctx) => Effect.succeed(ctx));
