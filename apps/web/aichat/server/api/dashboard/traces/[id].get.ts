import { join } from 'node:path';
import type { TraceEvent } from '@wai/ai-core';

const TRACE_FILE_PATH = process.env.TRACE_FILE_PATH || join(process.cwd(), '.data', 'traces.jsonl');

export default defineEventHandler(async (event) => {
  const traceId = getRouterParam(event, 'id');

  try {
    const file = Bun.file(TRACE_FILE_PATH);
    if (!(await file.exists())) {
      throw createError({ statusCode: 404, statusMessage: 'Trace file not found' });
    }

    const content = await file.text();
    const lines = content.trim().split('\n');
    if (!lines[0]) return [];

    const events: TraceEvent[] = lines
      .map((line: string) => JSON.parse(line))
      .filter((e: TraceEvent) => e.traceId === traceId);

    if (events.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Trace not found' });
    }

    return events;

  } catch (error) {
    console.error('Failed to read trace file:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load trace data',
    });
  }
});
