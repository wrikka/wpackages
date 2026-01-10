import { Context, Data, Effect, Layer, Queue } from "effect";
import type { EventHandler, EventType, JobEventData } from "../../types/event";

export class EventBusError extends Data.TaggedError("EventBusError")<{
	reason: string;
}> {}

const makeEventBus = Effect.gen(function* () {
	const queue = yield* Queue.unbounded<JobEventData>();
	const handlers = yield* Ref.make(
		new Map<EventType, ReadonlyArray<EventHandler>>(),
	);

	const emit = (event: JobEventData) =>
		Effect.gen(function* () {
			yield* Queue.offer(queue, event);

			const handlerMap = yield* Ref.get(handlers);
			const eventHandlers = handlerMap.get(event.type) ?? [];

			yield* Effect.forEach(eventHandlers, (handler) => handler(event), {
				concurrency: "unbounded",
				discard: true,
			});
		});

	const subscribe = (eventType: EventType, handler: EventHandler) =>
		Ref.update(handlers, (map) => {
			const existing = map.get(eventType) ?? [];
			return map.set(eventType, [...existing, handler]);
		});

	const unsubscribe = (eventType: EventType, handler: EventHandler) =>
		Ref.update(handlers, (map) => {
			const existing = map.get(eventType) ?? [];
			return map.set(
				eventType,
				existing.filter((h) => h !== handler),
			);
		});

	const take = () => Queue.take(queue);

	const shutdown = () => Queue.shutdown(queue);

	return { emit, subscribe, unsubscribe, take, shutdown };
});

export class EventBusTag extends Context.Tag("@wpackages/EventBus")<
	EventBusTag,
	ReturnType<typeof makeEventBus extends Effect.Effect<infer A> ? A : never>
>() {}

export const EventBusLive = Layer.effect(EventBusTag, makeEventBus);
