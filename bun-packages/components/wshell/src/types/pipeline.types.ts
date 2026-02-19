/**
 * Pipeline data types for wshell
 * Handles streaming and lazy evaluation
 */
import type { ListValue, RecordValue, ShellValue, TableValue } from "./value.types";

// Pipeline data flowing through commands
export type PipelineData =
  | { readonly _tag: "Value"; readonly value: ShellValue }
  | { readonly _tag: "ListStream"; readonly source: AsyncIterable<ShellValue> }
  | { readonly _tag: "TableStream"; readonly source: AsyncIterable<RecordValue>; readonly headers: readonly string[] }
  | { readonly _tag: "ByteStream"; readonly source: ReadableStream<Uint8Array> }
  | { readonly _tag: "Empty" };

// Constructors for PipelineData
export const pipelineValue = (value: ShellValue): PipelineData => ({
  _tag: "Value",
  value,
});

export const pipelineEmpty = (): PipelineData => ({ _tag: "Empty" });

export const pipelineListStream = (source: AsyncIterable<ShellValue>): PipelineData => ({
  _tag: "ListStream",
  source,
});

export const pipelineTableStream = (
  source: AsyncIterable<RecordValue>,
  headers: readonly string[]
): PipelineData => ({
  _tag: "TableStream",
  source,
  headers,
});

export const pipelineByteStream = (source: ReadableStream<Uint8Array>): PipelineData => ({
  _tag: "ByteStream",
  source,
});

// Type guards
export const isValue = (p: PipelineData): p is { _tag: "Value"; value: ShellValue } =>
  p._tag === "Value";

export const isListStream = (p: PipelineData): p is { _tag: "ListStream"; source: AsyncIterable<ShellValue> } =>
  p._tag === "ListStream";

export const isTableStream = (p: PipelineData): p is { _tag: "TableStream"; source: AsyncIterable<RecordValue>; headers: readonly string[] } =>
  p._tag === "TableStream";

export const isByteStream = (p: PipelineData): p is { _tag: "ByteStream"; source: ReadableStream<Uint8Array> } =>
  p._tag === "ByteStream";

export const isEmpty = (p: PipelineData): p is { _tag: "Empty" } =>
  p._tag === "Empty";

// Collect stream to value
export async function collectToValue(data: PipelineData): Promise<ShellValue> {
  const { int, list, table, str, binary, nil } = await import("./value.types");

  switch (data._tag) {
    case "Value":
      return data.value;

    case "Empty":
      return nil();

    case "ListStream": {
      const items: ShellValue[] = [];
      for await (const item of data.source) {
        items.push(item);
      }
      return list(items);
    }

    case "TableStream": {
      const rows: RecordValue[] = [];
      for await (const row of data.source) {
        rows.push(row);
      }
      return table(data.headers, rows);
    }

    case "ByteStream": {
      const reader = data.source.getReader();
      const chunks: Uint8Array[] = [];
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }

      // Concatenate chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return binary(result);
    }

    default:
      return nil();
  }
}

// Convert value to pipeline data
export const toPipelineData = (value: ShellValue): PipelineData => {
  return pipelineValue(value);
};
