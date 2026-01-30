import type { Event } from "./event-store";
import type { EventStore } from "./event-store";

export interface Aggregate<out S, out E> {
	readonly id: string;
	readonly state: S;
	readonly version: number;
	apply(event: Event<E>): Aggregate<S, E>;
}

export class AggregateRoot<S, E> implements Aggregate<S, E> {
	constructor(
		public readonly id: string,
		public readonly state: S,
		public readonly version = 0,
	) {}

	apply(_event: Event<E>): Aggregate<S, E> {
		return this as any;
	}
}

export interface AggregateRepository<out S, out E> {
	load(aggregateId: string): Promise<Aggregate<S, E>>;
	save(aggregate: Aggregate<S, E>): Promise<void>;
}

export class EventSourcedRepository<S, E> implements AggregateRepository<S, E> {
	constructor(private eventStore: EventStore<E>) {}

	async load(aggregateId: string): Promise<Aggregate<S, E>> {
		const events = await this.eventStore.getEvents(aggregateId);
		return this.replay(events);
	}

	async save(aggregate: Aggregate<S, E>): Promise<void> {
		const events = await this.eventStore.getEventsFromVersion(
			aggregate.id,
			aggregate.version,
		);
		await this.eventStore.append(aggregate.id, events);
	}

	private replay(events: Event<E>[]): Aggregate<S, E> {
		let aggregate: any = { id: "", state: {} as S, version: 0 };

		for (const event of events) {
			aggregate = aggregate.apply(event);
		}

		return aggregate;
	}
}

export const createRepository = <S, E>(eventStore: EventStore<E>): AggregateRepository<S, E> => {
	return new EventSourcedRepository<S, E>(eventStore);
};
