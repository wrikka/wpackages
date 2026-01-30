import type { Span } from "~/app/types/tracing";

export default defineEventHandler(async (event) => {
	const spans = await readBody<Span[]>(event);
	const storage = event.context.storage;

	if (Array.isArray(spans)) {
		storage.spans.push(...spans);
	}

	// A simple mechanism to keep the array from growing indefinitely
	if (storage.spans.length > 1000) {
		storage.spans.splice(0, storage.spans.length - 1000);
	}

	return { received: spans.length };
});
