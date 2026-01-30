import { EventBatch } from '../types/analytics.js';
import { AnalyticsNetworkError } from '../error.js';

export const compressEventBatch = async (
  batch: EventBatch,
  threshold: number,
): Promise<EventBatch | Uint8Array> => {
  const jsonString = JSON.stringify(batch);
  const size = new Blob([jsonString]).size;

  if (size < threshold) {
    return batch;
  }

  try {
    const compressed = new TextEncoder().encode(jsonString);
    if (typeof CompressionStream !== 'undefined') {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      await writer.write(compressed.buffer as ArrayBuffer);
      await writer.close();
      const reader = stream.readable.getReader();
      const chunks: Uint8Array[] = [];
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) chunks.push(value);
      }
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      return result;
    }
    return batch;
  } catch {
    return batch;
  }
};

export const decompressEventBatch = async (
  data: EventBatch | Uint8Array,
): Promise<EventBatch> => {
  if (data instanceof Uint8Array) {
    try {
      if (typeof DecompressionStream !== 'undefined') {
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        await writer.write(data);
        await writer.close();
        const reader = stream.readable.getReader();
        const chunks: Uint8Array[] = [];
        let done = false;
        while (!done) {
          const { value, done: d } = await reader.read();
          done = d;
          if (value) chunks.push(value);
        }
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        const jsonString = new TextDecoder().decode(result);
        return JSON.parse(jsonString);
      }
    } catch {
      throw new AnalyticsNetworkError('Failed to decompress event batch');
    }
  }
  return data;
};
