import type { Span } from "../../../../src/types/tracing";
import { ingestSpans } from "../../../../src/tracer";

export default defineEventHandler(async (event) => {
	const spans = await readBody<Span[]>(event);
	await ingestSpans(spans);
	return { status: "ok" };
});
