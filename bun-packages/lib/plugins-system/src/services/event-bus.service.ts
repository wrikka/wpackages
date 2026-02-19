import type {
	AdvancedEventBus,
	EventFilter,
	EventReplayOptions,
	EventSubscription,
	EventTransformer,
	PersistedEvent,
} from "../types/event-bus.types";

export const createAdvancedEventBus = (): AdvancedEventBus => {
	const subscriptions: Map<string, EventSubscription> = new Map();
	let subscriptionIdCounter = 0;
	const eventHistory: PersistedEvent[] = [];
	let persistenceEnabled = false;
	let storageDir: string | null = null;

	const subscribe = (
		eventType: string,
		handler: (event: unknown) => void | Promise<void>,
		options: {
			readonly filter?: EventFilter;
			readonly transformer?: EventTransformer;
			readonly once?: boolean;
		} = {},
	): (() => void) => {
		const id = `sub_${subscriptionIdCounter++}`;

		const subscription: EventSubscription = {
			id,
			eventType,
			handler,
			filter: options.filter,
			transformer: options.transformer,
			once: options.once ?? false,
		};

		subscriptions.set(id, subscription);

		return () => {
			unsubscribe(id);
		};
	};

	const publish = async <T = unknown>(
		eventType: string,
		data: T,
		metadata: { readonly pluginId?: string } = {},
	): Promise<void> => {
		const event: PersistedEvent = {
			id: `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
			eventType,
			pluginId: metadata.pluginId ?? "system",
			timestamp: new Date(),
			data,
		};

		eventHistory.push(event);

		if (persistenceEnabled && storageDir) {
			await persistEvent(event);
		}

		const matchingSubscriptions = Array.from(subscriptions.values()).filter(
			(sub) => sub.eventType === eventType || sub.eventType === "*",
		);

		for (const subscription of matchingSubscriptions) {
			if (subscription.filter) {
				if (
					subscription.filter.eventType &&
					subscription.filter.eventType !== eventType
				) {
					continue;
				}
				if (
					subscription.filter.pluginId &&
					subscription.filter.pluginId !== metadata.pluginId
				) {
					continue;
				}
				if (
					subscription.filter.dataFilter &&
					!subscription.filter.dataFilter(data)
				) {
					continue;
				}
			}

			let eventData = event as unknown;

			if (subscription.transformer) {
				eventData = await subscription.transformer.transform(event);
			}

			try {
				await subscription.handler(eventData);
			} catch {
			}

			if (subscription.once) {
				unsubscribe(subscription.id);
			}
		}
	};

	const unsubscribe = (subscriptionId: string): void => {
		subscriptions.delete(subscriptionId);
	};

	const clear = (): void => {
		subscriptions.clear();
	};

	const getSubscriptions = (): readonly EventSubscription[] => {
		return Object.freeze(Array.from(subscriptions.values()));
	};

	const enablePersistence = async (_storageDir: string): Promise<void> => {
		storageDir = _storageDir;
		persistenceEnabled = true;
	};

	const disablePersistence = async (): Promise<void> => {
		persistenceEnabled = false;
		storageDir = null;
	};

	const persistEvent = async (_event: PersistedEvent): Promise<void> => {
	};

	const replay = async (options: EventReplayOptions): Promise<readonly PersistedEvent[]> => {
		let filtered = [...eventHistory];

		if (options.eventType) {
			filtered = filtered.filter((e) => e.eventType === options.eventType);
		}

		if (options.since) {
			filtered = filtered.filter((e) => e.timestamp >= options.since!);
		}

		if (options.until) {
			filtered = filtered.filter((e) => e.timestamp <= options.until!);
		}

		if (options.limit) {
			filtered = filtered.slice(-options.limit);
		}

		for (const event of filtered) {
			const matchingSubscriptions = Array.from(subscriptions.values()).filter(
				(sub) => sub.eventType === event.eventType || sub.eventType === "*",
			);

			for (const subscription of matchingSubscriptions) {
				try {
					await subscription.handler(event);
				} catch {
				}
			}
		}

		return Object.freeze(filtered);
	};

	const getHistory = async (options: EventReplayOptions): Promise<readonly PersistedEvent[]> => {
		let filtered = [...eventHistory];

		if (options.eventType) {
			filtered = filtered.filter((e) => e.eventType === options.eventType);
		}

		if (options.since) {
			filtered = filtered.filter((e) => e.timestamp >= options.since!);
		}

		if (options.until) {
			filtered = filtered.filter((e) => e.timestamp <= options.until!);
		}

		if (options.limit) {
			filtered = filtered.slice(-options.limit);
		}

		return Object.freeze(filtered);
	};

	return Object.freeze({
		subscribe,
		publish,
		unsubscribe,
		clear,
		getSubscriptions,
		enablePersistence,
		disablePersistence,
		replay,
		getHistory,
	});
};
