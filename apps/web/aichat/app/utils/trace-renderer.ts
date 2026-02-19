// @ts-nocheck
// This file contains the same logic as the CLI's trace-renderer, adapted for the browser.

export interface SpanInfo {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  durationMs: number;
  status: 'ok' | 'error';
  attributes: Record<string, unknown>;
  children: SpanInfo[];
}

export function buildTraceTree(events: readonly any[]): SpanInfo[] {
  const spanMap = new Map<string, { start: any; end?: any }>();

  for (const event of events) {
    if (!event.spanId) continue;
    const isEnd = event.name.endsWith(':end') || event.name.endsWith(':error');
    const span = spanMap.get(event.spanId) ?? { start: event };
    if (isEnd) {
      span.end = event;
    } else {
      span.start = event;
    }
    spanMap.set(event.spanId, span);
  }

  const spanInfoMap = new Map<string, SpanInfo>();
  const rootSpans: SpanInfo[] = [];

  for (const [, { start, end }] of spanMap) {
    if (!start || !end) continue;
    const info: SpanInfo = {
      traceId: start.traceId,
      spanId: start.spanId!,
      parentSpanId: start.parentSpanId,
      name: start.name,
      startTime: start.time,
      durationMs: end.time - start.time,
      status: end.name.endsWith(':error') ? 'error' : 'ok',
      attributes: { ...start.attributes, ...end.attributes },
      children: [],
    };
    spanInfoMap.set(info.spanId, info);
  }

  for (const info of spanInfoMap.values()) {
    if (info.parentSpanId && spanInfoMap.has(info.parentSpanId)) {
      spanInfoMap.get(info.parentSpanId)!.children.push(info);
    } else {
      rootSpans.push(info);
    }
  }

  // Sort spans by start time
  const sortByStartTime = (a: SpanInfo, b: SpanInfo) => a.startTime - b.startTime;
  rootSpans.sort(sortByStartTime);
  for (const span of spanInfoMap.values()) {
    span.children.sort(sortByStartTime);
  }

  return rootSpans;
}
