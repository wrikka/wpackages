export interface Event<out E> {
	readonly id: string;
	readonly aggregateId: string;
	readonly type: string;
	readonly data: E;
	readonly timestamp: number;
	readonly version: number;
}

export interface EventStore<out E> {
	append(aggregateId: string, events: Event<E>[]): Promise<void>;
	getEvents(aggregateId: string): Promise<Event<E>[]>;
	getEventsFromVersion(aggregateId: string, version: number): Promise<Event<E>[]>;
}

export class InMemoryEventStore<E> implements EventStore<E> {
	private events = new Map<string, Event<E>[]>();

	async append(aggregateId: string, events: Event<E>[]): Promise<void> {
		const existing = this.events.get(aggregateId) || [];
		const lastVersion = existing.length > 0 ? existing[existing.length - 1]?.version ?? 0 : 0;

		events.forEach((event, index) => {
			const updatedEvent = {
				...event,
				version: lastVersion + index + 1
			};
			events[index] = updatedEvent;
		});

		this.events.set(aggregateId, [...existing, ...events]);
	}

	async getEvents(aggregateId: string): Promise<Event<E>[]> {
		return this.events.get(aggregateId) || [];
	}

	async getEventsFromVersion(aggregateId: string, version: number): Promise<Event<E>[]> {
		const events = this.events.get(aggregateId) || [];
		return events.filter((e) => e.version > version);
	}
}

export const createEventStore = <E>(): EventStore<E> => {
	return new InMemoryEventStore<E>();
};
