import { join } from 'node:path';
import type { TraceEvent } from '@wai/ai-core';

// In a real application, this path would be configurable.
const TRACE_FILE_PATH = process.env.TRACE_FILE_PATH || join(process.cwd(), '.data', 'traces.jsonl');

export default defineEventHandler(async () => {
  try {
    const file = Bun.file(TRACE_FILE_PATH);
    if (!(await file.exists())) {
      return [];
    }

    const content = await file.text();
    const lines = content.trim().split('\n');
    if (!lines[0]) return []; // Handle empty file

    const events: TraceEvent[] = lines.map((line: string) => JSON.parse(line));

    // Group events by traceId to create a summary
    const traces = new Map<string, { traceId: string; rootSpanName: string; startTime: number; eventCount: number }>();

    for (const event of events) {
      if (!traces.has(event.traceId)) {
        traces.set(event.traceId, {
          traceId: event.traceId,
          rootSpanName: event.name, // Simple assumption: first event is the root
          startTime: event.time,
          eventCount: 0,
        });
      }
      const trace = traces.get(event.traceId)!;
      trace.eventCount++;
    }

    return Array.from(traces.values()).sort((a, b) => b.startTime - a.startTime);

  } catch (error) {
    console.error('Failed to read trace file:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load trace data',
    });
  }
});
