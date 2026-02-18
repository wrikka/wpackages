/**
 * Tests for wshell value types
 */
import { describe, expect, test } from "vitest";
import {
  int,
  float,
  str,
  bool,
  date,
  filesize,
  duration,
  nil,
  list,
  record,
  table,
  binary,
  isInt,
  isFloat,
  isString,
  isBool,
  isList,
  isRecord,
  isTable,
  isBinary,
  isNull,
  getType,
  toString,
  toJSON,
} from "./value.types";

describe("value types", () => {
  describe("primitives", () => {
    test("int", () => {
      const v = int(42);
      expect(v._tag).toBe("Int");
      expect(v.value).toBe(42n);
      expect(isInt(v)).toBe(true);
      expect(getType(v)).toBe("int");
      expect(toString(v)).toBe("42");
    });

    test("float", () => {
      const v = float(3.14);
      expect(v._tag).toBe("Float");
      expect(v.value).toBe(3.14);
      expect(isFloat(v)).toBe(true);
    });

    test("string", () => {
      const v = str("hello");
      expect(v._tag).toBe("String");
      expect(v.value).toBe("hello");
      expect(isString(v)).toBe(true);
      expect(toString(v)).toBe("hello");
    });

    test("bool", () => {
      const v = bool(true);
      expect(v._tag).toBe("Bool");
      expect(v.value).toBe(true);
      expect(isBool(v)).toBe(true);
      expect(toString(v)).toBe("true");
    });

    test("null", () => {
      const v = nil();
      expect(v._tag).toBe("Null");
      expect(isNull(v)).toBe(true);
      expect(toString(v)).toBe("null");
    });

    test("date", () => {
      const now = new Date("2024-01-15");
      const v = date(now);
      expect(v._tag).toBe("Date");
      expect(v.value).toEqual(now);
      expect(toString(v)).toBe(now.toISOString());
    });

    test("filesize", () => {
      const v = filesize(1024n, "KB");
      expect(v._tag).toBe("Filesize");
      expect(v.value).toBe(1024n);
      expect(v.unit).toBe("KB");
      expect(toString(v)).toBe("1024KB");
    });

    test("duration", () => {
      const v = duration(100n, "ms");
      expect(v._tag).toBe("Duration");
      expect(v.value).toBe(100n);
      expect(v.unit).toBe("ms");
      expect(toString(v)).toBe("100ms");
    });
  });

  describe("collections", () => {
    test("list", () => {
      const items = [int(1), int(2), int(3)];
      const v = list(items);
      expect(v._tag).toBe("List");
      expect(v.items).toHaveLength(3);
      expect(isList(v)).toBe(true);
      expect(toString(v)).toBe("[1, 2, 3]");
    });

    test("record", () => {
      const v = record({ name: str("John"), age: int(30) });
      expect(v._tag).toBe("Record");
      expect(v.fieldNames).toContain("name");
      expect(v.fieldNames).toContain("age");
      expect(isRecord(v)).toBe(true);
      expect(getType(v)).toEqual({ record: ["name", "age"] });
    });

    test("table", () => {
      const rows = [
        record({ name: str("Alice"), age: int(25) }),
        record({ name: str("Bob"), age: int(30) }),
      ];
      const v = table(["name", "age"], rows);
      expect(v._tag).toBe("Table");
      expect(v.headers).toEqual(["name", "age"]);
      expect(v.rows).toHaveLength(2);
      expect(v.count).toBe(2);
      expect(isTable(v)).toBe(true);
      expect(toString(v)).toBe("<table 2 rows>");
    });

    test("binary", () => {
      const data = new Uint8Array([1, 2, 3]);
      const v = binary(data);
      expect(v._tag).toBe("Binary");
      expect(v.data).toEqual(data);
      expect(isBinary(v)).toBe(true);
      expect(toString(v)).toBe("<binary 3 bytes>");
    });

    test("binary from string", () => {
      const v = binary("hello");
      expect(v._tag).toBe("Binary");
      expect(v.data).toEqual(new TextEncoder().encode("hello"));
    });
  });

  describe("type guards", () => {
    test("type guards work correctly", () => {
      expect(isInt(int(1))).toBe(true);
      expect(isInt(str("test"))).toBe(false);

      expect(isString(str("test"))).toBe(true);
      expect(isString(int(1))).toBe(false);

      expect(isList(list([int(1)]))).toBe(true);
      expect(isList(str("test"))).toBe(false);
    });
  });

  describe("toJSON", () => {
    test("primitives to JSON", () => {
      expect(toJSON(int(42))).toBe("42");
      expect(toJSON(float(3.14))).toBe(3.14);
      expect(toJSON(str("hello"))).toBe("hello");
      expect(toJSON(bool(true))).toBe(true);
      expect(toJSON(nil())).toBe(null);
    });

    test("list to JSON", () => {
      const v = list([int(1), int(2)]);
      expect(toJSON(v)).toEqual(["1", "2"]);
    });

    test("record to JSON", () => {
      const v = record({ name: str("John"), age: int(30) });
      expect(toJSON(v)).toEqual({ name: "John", age: "30" });
    });

    test("table to JSON", () => {
      const rows = [
        record({ name: str("Alice"), age: int(25) }),
      ];
      const v = table(["name", "age"], rows);
      expect(toJSON(v)).toEqual([{ name: "Alice", age: "25" }]);
    });
  });
});
