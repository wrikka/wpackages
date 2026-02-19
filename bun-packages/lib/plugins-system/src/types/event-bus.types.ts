export interface EventFilter {
	readonly eventType?: string;
	readonly pluginId?: string;
	readonly dataFilter?: (data: unknown) => boolean;
}

export interface EventTransformer<T = unknown, R = unknown> {
	readonly transform: (event: T) => R | Promise<R>;
}

export interface EventSubscription {
	readonly id: string;
	readonly eventType: string;
	readonly handler: (event: unknown) => void | Promise<void>;
	readonly filter?: EventFilter;
	readonly transformer?: EventTransformer;
	readonly once: boolean;
}

export interface EventReplayOptions {
	readonly limit?: number;
	readonly eventType?: string;
	readonly since?: Date;
	readonly until?: Date;
}

export interface PersistedEvent {
	readonly id: string;
	readonly eventType: string;
	readonly pluginId: string;
	readonly timestamp: Date;
	readonly data: unknown;
}

export interface AdvancedEventBus {
	readonly subscribe: (
		eventType: string,
		handler: (event: unknown) => void | Promise<void>,
		options?: {
			readonly filter?: EventFilter;
			readonly transformer?: EventTransformer;
			readonly once?: boolean;
		},
	) => () => void;
	readonly publish: <T = unknown>(
		eventType: string,
		data: T,
		metadata?: { readonly pluginId?: string },
	) => Promise<void>;
	readonly unsubscribe: (subscriptionId: string) => void;
	readonly clear: () => void;
	readonly getSubscriptions: () => readonly EventSubscription[];
	readonly enablePersistence: (storageDir: string) => Promise<void>;
	readonly disablePersistence: () => Promise<void>;
	readonly replay: (options: EventReplayOptions) => Promise<readonly PersistedEvent[]>;
	readonly getHistory: (options: EventReplayOptions) => Promise<readonly PersistedEvent[]>;
}
