export type WorkerHandler<T = unknown, R = unknown> = (data: T) => Promise<R> | R;

export interface WorkerMessage {
	readonly id: string;
	readonly type: "rpc" | "ping" | "pong";
	readonly handler?: string;
	readonly data?: unknown;
}

export interface WorkerResponse {
	readonly id: string;
	readonly type: "success" | "error" | "pong";
	readonly result?: unknown;
	readonly error?: string;
}

const handlers = new Map<string, WorkerHandler>();

export function registerHandler<T, R>(name: string, handler: WorkerHandler<T, R>): void {
	handlers.set(name, handler as WorkerHandler);
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
	const { id, type, handler, data } = event.data;

	if (type === "ping") {
		self.postMessage({ id, type: "pong" } as WorkerResponse);
		return;
	}

	if (type !== "rpc" || !handler) {
		self.postMessage({ id, type: "error", error: "Invalid message type or missing handler" } as WorkerResponse);
		return;
	}

	const handlerFn = handlers.get(handler);
	if (!handlerFn) {
		self.postMessage({ id, type: "error", error: `Handler "${handler}" not found` } as WorkerResponse);
		return;
	}

	try {
		const result = await handlerFn(data);
		self.postMessage({ id, type: "success", result } as WorkerResponse);
	} catch (error) {
		self.postMessage({ id, type: "error", error: String(error) } as WorkerResponse);
	}
};

export { handlers };
