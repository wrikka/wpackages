import { getActiveSpan } from "../services/context.service";

/**
 * Returns the trace context (traceId and spanId) of the currently active span.
 * Useful for injecting into structured logs for correlation.
 * @returns An object with traceId and spanId, or an empty object if no span is active.
 */
export function getTraceContext(): { traceId?: string; spanId?: string } {
  const span = getActiveSpan();
  if (!span) {
    return {};
  }
  return {
    traceId: span.traceId,
    spanId: span.spanId,
  };
}
