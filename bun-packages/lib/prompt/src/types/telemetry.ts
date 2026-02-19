export interface TelemetryEvent {
	type: string;
	timestamp: number;
	data: Record<string, unknown>;
}

export interface TelemetryOptions {
	enabled?: boolean;
	endpoint?: string;
	batchSize?: number;
	flushInterval?: number;
	sampleRate?: number;
}

export interface TelemetryContext {
	track: (event: string, data?: Record<string, unknown>) => void;
	flush: () => Promise<void>;
	disable: () => void;
	enable: () => void;
	getEvents: () => TelemetryEvent[];
	clear: () => void;
}
