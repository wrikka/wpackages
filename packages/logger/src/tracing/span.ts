import { Effect } from "effect";
import type { LogMeta, LogSpan } from "../types";

const generateSpanId = (): string => `span_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const createSpan = (name: string, parentId?: string, meta?: LogMeta): LogSpan => ({
	id: generateSpanId(),
	parentId,
	name,
	startTime: Date.now(),
	meta,
});

export const endSpan = (span: LogSpan): LogSpan => ({
	...span,
	endTime: Date.now(),
});

export const withSpan = <A, E>(span: LogSpan, effect: Effect.Effect<A, E>): Effect.Effect<A, E> => {
	return Effect.tap(effect, () => Effect.sync(() => endSpan(span)));
};
