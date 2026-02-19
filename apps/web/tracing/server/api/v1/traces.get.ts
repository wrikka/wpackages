import type { Span } from "~/app/types/tracing";

export default defineEventHandler((event) => {
	return event.context.storage.spans as Span[];
});
