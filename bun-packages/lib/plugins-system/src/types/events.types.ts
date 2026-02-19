export type PluginEventType =
	| "plugin:installed"
	| "plugin:enabled"
	| "plugin:disabled"
	| "plugin:uninstalled"
	| "plugin:updated"
	| "plugin:error"
	| "plugin:loaded"
	| `custom:${string}`;

export interface PluginEvent<T = unknown> {
	readonly type: PluginEventType;
	readonly pluginId: string;
	readonly timestamp: Date;
	readonly data?: T;
}

export type PluginEventHandler<T = unknown> = (
	event: PluginEvent<T>,
) => void | Promise<void>;

export interface PluginEventEmitter {
	readonly on: <T = unknown>(
		type: PluginEventType,
		handler: PluginEventHandler<T>,
	) => void;
	readonly off: <T = unknown>(
		type: PluginEventType,
		handler: PluginEventHandler<T>,
	) => void;
	readonly emit: <T = unknown>(event: PluginEvent<T>) => Promise<void>;
	readonly once: <T = unknown>(
		type: PluginEventType,
		handler: PluginEventHandler<T>,
	) => void;
}
