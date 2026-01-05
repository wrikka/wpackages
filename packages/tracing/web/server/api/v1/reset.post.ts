import { resetFinishedSpans } from "../../../../src/tracer";

export default defineEventHandler(() => {
	resetFinishedSpans();
	return { status: "ok" };
});
