/**
 * Core value types for wshell structured data pipeline
 * Inspired by Nushell's Value enum but with TypeScript type safety
 */

// Primitive value types
export type IntValue = { readonly _tag: "Int"; readonly value: bigint };
export type FloatValue = { readonly _tag: "Float"; readonly value: number };
export type StringValue = { readonly _tag: "String"; readonly value: string };
export type BoolValue = { readonly _tag: "Bool"; readonly value: boolean };
export type DateValue = { readonly _tag: "Date"; readonly value: Date };
export type FilesizeValue = { readonly _tag: "Filesize"; readonly value: bigint; readonly unit: FilesizeUnit };
export type DurationValue = { readonly _tag: "Duration"; readonly value: bigint; readonly unit: DurationUnit };
export type NullValue = { readonly _tag: "Null" };

// Collection types
export type ListValue<T extends ShellValue = ShellValue> = {
  readonly _tag: "List";
  readonly items: readonly T[];
  readonly itemType?: Type;
};

export type RecordValue = {
  readonly _tag: "Record";
  readonly fields: Readonly<Record<string, ShellValue>>;
  readonly fieldNames: readonly string[];
};

export type TableValue = {
  readonly _tag: "Table";
  readonly headers: readonly string[];
  readonly rows: readonly RecordValue[];
  readonly count: number;
};

// Special types
export type RangeValue = {
  readonly _tag: "Range";
  readonly start: ShellValue;
  readonly end: ShellValue;
  readonly inclusive: boolean;
};

export type CellPathValue = {
  readonly _tag: "CellPath";
  readonly path: readonly (string | number)[];
};

export type BinaryValue = {
  readonly _tag: "Binary";
  readonly data: Uint8Array;
};

export type ClosureValue = {
  readonly _tag: "Closure";
  readonly params: readonly string[];
  readonly body: string;
  readonly captured: Readonly<Record<string, ShellValue>>;
};

// The main Value discriminated union
export type ShellValue =
  | IntValue
  | FloatValue
  | StringValue
  | BoolValue
  | DateValue
  | FilesizeValue
  | DurationValue
  | NullValue
  | ListValue
  | RecordValue
  | TableValue
  | RangeValue
  | CellPathValue
  | BinaryValue
  | ClosureValue;

// Units
export type FilesizeUnit = "B" | "KB" | "MB" | "GB" | "TB" | "PB";
export type DurationUnit = "ns" | "us" | "ms" | "sec" | "min" | "hr" | "day" | "wk";

// Type system for wshell
export type Type =
  | "int"
  | "float"
  | "string"
  | "bool"
  | "date"
  | "filesize"
  | "duration"
  | "null"
  | { list: Type }
  | { record: readonly string[] }
  | { table: readonly string[] }
  | "range"
  | "cellpath"
  | "binary"
  | "closure"
  | "any";

// Type guards
export const isInt = (v: ShellValue): v is IntValue => v._tag === "Int";
export const isFloat = (v: ShellValue): v is FloatValue => v._tag === "Float";
export const isString = (v: ShellValue): v is StringValue => v._tag === "String";
export const isBool = (v: ShellValue): v is BoolValue => v._tag === "Bool";
export const isDate = (v: ShellValue): v is DateValue => v._tag === "Date";
export const isList = (v: ShellValue): v is ListValue => v._tag === "List";
export const isRecord = (v: ShellValue): v is RecordValue => v._tag === "Record";
export const isTable = (v: ShellValue): v is TableValue => v._tag === "Table";
export const isBinary = (v: ShellValue): v is BinaryValue => v._tag === "Binary";
export const isNull = (v: ShellValue): v is NullValue => v._tag === "Null";

// Constructors
export const int = (value: bigint | number): IntValue => ({
  _tag: "Int",
  value: typeof value === "number" ? BigInt(Math.trunc(value)) : value
});

export const float = (value: number): FloatValue => ({ _tag: "Float", value });

export const str = (value: string): StringValue => ({ _tag: "String", value });

export const bool = (value: boolean): BoolValue => ({ _tag: "Bool", value });

export const date = (value: Date): DateValue => ({ _tag: "Date", value });

export const filesize = (value: bigint | number, unit: FilesizeUnit = "B"): FilesizeValue => ({
  _tag: "Filesize",
  value: typeof value === "number" ? BigInt(Math.trunc(value)) : value,
  unit,
});

export const duration = (value: bigint | number, unit: DurationUnit = "ms"): DurationValue => ({
  _tag: "Duration",
  value: typeof value === "number" ? BigInt(Math.trunc(value)) : value,
  unit,
});

export const nil = (): NullValue => ({ _tag: "Null" });

export const list = <T extends ShellValue>(items: readonly T[], itemType?: Type): ListValue<T> => ({
  _tag: "List",
  items,
  itemType,
});

export const record = (fields: Record<string, ShellValue>): RecordValue => {
  const fieldNames = Object.keys(fields);
  return {
    _tag: "Record",
    fields,
    fieldNames,
  };
};

export const table = (headers: readonly string[], rows: readonly RecordValue[]): TableValue => ({
  _tag: "Table",
  headers,
  rows,
  count: rows.length,
});

export const binary = (data: Uint8Array | ArrayBuffer | string): BinaryValue => {
  if (typeof data === "string") {
    const encoder = new TextEncoder();
    return { _tag: "Binary", data: encoder.encode(data) };
  }
  if (data instanceof ArrayBuffer) {
    return { _tag: "Binary", data: new Uint8Array(data) };
  }
  return { _tag: "Binary", data };
};

// Get type of value
export const getType = (value: ShellValue): Type => {
  switch (value._tag) {
    case "Int": return "int";
    case "Float": return "float";
    case "String": return "string";
    case "Bool": return "bool";
    case "Date": return "date";
    case "Filesize": return "filesize";
    case "Duration": return "duration";
    case "Null": return "null";
    case "List": return { list: value.itemType ?? "any" };
    case "Record": return { record: value.fieldNames };
    case "Table": return { table: value.headers };
    case "Range": return "range";
    case "CellPath": return "cellpath";
    case "Binary": return "binary";
    case "Closure": return "closure";
    default: return "any";
  }
};

// Convert value to string representation
export const toString = (value: ShellValue): string => {
  switch (value._tag) {
    case "Int": return value.value.toString();
    case "Float": return value.value.toString();
    case "String": return value.value;
    case "Bool": return value.value.toString();
    case "Date": return value.value.toISOString();
    case "Filesize": return `${value.value}${value.unit}`;
    case "Duration": return `${value.value}${value.unit}`;
    case "Null": return "null";
    case "List": return `[${value.items.map(toString).join(", ")}]`;
    case "Record": {
      const entries = value.fieldNames.map(k => `${k}: ${toString(value.fields[k]!)}`);
      return `{${entries.join(", ")}}`;
    }
    case "Table": return `<table ${value.count} rows>`;
    case "Range": return `${toString(value.start)}..${value.inclusive ? "=" : ""}${toString(value.end)}`;
    case "CellPath": return value.path.join(".");
    case "Binary": return `<binary ${value.data.length} bytes>`;
    case "Closure": return `<closure (${value.params.join(", ")})>`;
    default: return "";
  }
};

// Convert value to JSON-serializable format
export const toJSON = (value: ShellValue): unknown => {
  switch (value._tag) {
    case "Int": return value.value.toString();
    case "Float": return value.value;
    case "String": return value.value;
    case "Bool": return value.value;
    case "Date": return value.value.toISOString();
    case "Filesize": return { value: value.value.toString(), unit: value.unit };
    case "Duration": return { value: value.value.toString(), unit: value.unit };
    case "Null": return null;
    case "List": return value.items.map(toJSON);
    case "Record": {
      const result: Record<string, unknown> = {};
      for (const key of value.fieldNames) {
        result[key] = toJSON(value.fields[key]!);
      }
      return result;
    }
    case "Table": {
      return value.rows.map(row => toJSON(row));
    }
    case "Binary": return Array.from(value.data);
    default: return null;
  }
};
