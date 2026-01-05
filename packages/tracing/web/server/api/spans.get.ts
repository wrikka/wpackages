import { getFinishedSpans } from "../../../src/tracer";

export default defineEventHandler(() => {
	return getFinishedSpans();
});
