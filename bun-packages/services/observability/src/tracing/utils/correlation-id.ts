const CORRELATION_ID_KEY = Symbol("correlation-id");
const CORRELATION_ID_HEADER = "X-Correlation-ID";

export function generateCorrelationId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function setCorrelationId(id: string): void {
	if (typeof globalThis !== "undefined") {
		(globalThis as any)[CORRELATION_ID_KEY] = id;
	}
}

export function getCorrelationId(): string | undefined {
	if (typeof globalThis !== "undefined") {
		return (globalThis as any)[CORRELATION_ID_KEY];
	}
	return undefined;
}

export function clearCorrelationId(): void {
	if (typeof globalThis !== "undefined") {
		delete (globalThis as any)[CORRELATION_ID_KEY];
	}
}

export function withCorrelationId<T>(id: string, fn: () => T): T {
	const previousId = getCorrelationId();
	setCorrelationId(id);
	try {
		return fn();
	} finally {
		if (previousId) {
			setCorrelationId(previousId);
		} else {
			clearCorrelationId();
		}
	}
}

export function getCorrelationIdHeader(): string {
	return CORRELATION_ID_HEADER;
}

export function extractCorrelationIdFromHeaders(
	headers: Record<string, string | string[] | undefined>,
): string | undefined {
	const header = headers[CORRELATION_ID_HEADER];
	if (typeof header === "string") {
		return header;
	}
	if (Array.isArray(header) && header.length > 0) {
		return header[0];
	}
	return undefined;
}

export function injectCorrelationIdToHeaders(
	headers: Record<string, string | string[] | undefined>,
): Record<string, string | string[]> {
	const id = getCorrelationId() || generateCorrelationId();
	return {
		...headers,
		[CORRELATION_ID_HEADER]: id,
	};
}
