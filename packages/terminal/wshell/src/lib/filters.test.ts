/**
 * Tests for wshell filter commands
 */
import { describe, expect, test } from "vitest";
import {
  filterWhere,
  selectColumns,
  getValue,
  sortBy,
  groupBy,
  getLength,
  getFirst,
  getLast,
  flattenList,
  uniqueItems,
  reverseItems,
} from "./filters";
import { pipelineValue } from "../types/pipeline.types";
import { list, record, table, str, int, toString } from "../types/value.types";
import type { CommandArg } from "../types/command.types";

describe("filter commands", () => {
  describe("where", () => {
    test("filters list by condition", async () => {
      const items = list([
        record({ name: str("Alice"), age: int(25) }),
        record({ name: str("Bob"), age: int(30) }),
        record({ name: str("Charlie"), age: int(35) }),
      ]);

      const args: CommandArg[] = [
        { _tag: "Positional", value: "age" },
        { _tag: "Positional", value: ">=" },
        { _tag: "Positional", value: "30" },
      ];

      const result = await filterWhere(args, pipelineValue(items));
      const output = result.stdout;

      expect(output._tag).toBe("Value");
      if (output._tag === "Value" && output.value._tag === "List") {
        expect(output.value.items).toHaveLength(2);
      }
    });

    test("filters table by condition", async () => {
      const rows = [
        record({ name: str("Alice"), age: int(25) }),
        record({ name: str("Bob"), age: int(30) }),
      ];
      const data = table(["name", "age"], rows);

      const args: CommandArg[] = [
        { _tag: "Positional", value: "name" },
        { _tag: "Positional", value: "==" },
        { _tag: "Positional", value: "Bob" },
      ];

      const result = await filterWhere(args, pipelineValue(data));
      const output = result.stdout;

      expect(output._tag).toBe("Value");
      if (output._tag === "Value" && output.value._tag === "Table") {
        expect(output.value.rows).toHaveLength(1);
        expect(toString(output.value.rows[0]!.fields["name"]!)).toBe("Bob");
      }
    });
  });

  describe("select", () => {
    test("selects specific columns from table", async () => {
      const rows = [
        record({ name: str("Alice"), age: int(25), city: str("NYC") }),
        record({ name: str("Bob"), age: int(30), city: str("LA") }),
      ];
      const data = table(["name", "age", "city"], rows);

      const args: CommandArg[] = [
        { _tag: "Positional", value: "name" },
        { _tag: "Positional", value: "age" },
      ];

      const result = await selectColumns(args, pipelineValue(data));
      const output = result.stdout;

      expect(output._tag).toBe("Value");
      if (output._tag === "Value" && output.value._tag === "Table") {
        expect(output.value.headers).toEqual(["name", "age"]);
        expect(output.value.rows[0]!.fieldNames).toEqual(["name", "age"]);
      }
    });
  });

  describe("get", () => {
    test("gets value at path", async () => {
      const data = record({ user: record({ name: str("Alice") }) });

      const args: CommandArg[] = [
        { _tag: "Positional", value: "user.name" },
      ];

      const result = await getValue(args, pipelineValue(data));
      const output = result.stdout;

      expect(output._tag).toBe("Value");
      if (output._tag === "Value") {
        expect(output.value._tag).toBe("String");
        expect(toString(output.value)).toBe("Alice");
      }
    });
  });

  describe("sort-by", () => {
    test("sorts table by column", async () => {
      const rows = [
        record({ name: str("Charlie"), age: int(35) }),
        record({ name: str("Alice"), age: int(25) }),
        record({ name: str("Bob"), age: int(30) }),
      ];
      const data = table(["name", "age"], rows);

      const args: CommandArg[] = [{ _tag: "Positional", value: "age" }];

      const result = await sortBy(args, pipelineValue(data));
      const output = result.stdout;

      expect(output._tag).toBe("Value");
      if (output._tag === "Value" && output.value._tag === "Table") {
        expect(toString(output.value.rows[0]!.fields["name"]!)).toBe("Alice");
        expect(toString(output.value.rows[2]!.fields["name"]!)).toBe("Charlie");
      }
    });
  });

  describe("length", () => {
    test("returns list length", async () => {
      const data = list([int(1), int(2), int(3)]);
      const args: CommandArg[] = [];

      const result = await getLength(args, pipelineValue(data));
      const output = result.stdout;

      expect(output._tag).toBe("Value");
      if (output._tag === "Value" && output.value._tag === "Int") {
        expect(output.value.value).toBe(3n);
      }
    });

    test("returns table row count", async () => {
      const rows = [
        record({ name: str("Alice") }),
        record({ name: str("Bob") }),
      ];
      const data = table(["name"], rows);
      const args: CommandArg[] = [];

      const result = await getLength(args, pipelineValue(data));
      const output = result.stdout;

      expect(output._tag).toBe("Value");
      if (output._tag === "Value" && output.value._tag === "Int") {
        expect(output.value.value).toBe(2n);
      }
    });
  });

  describe("first", () => {
    test("returns first n items", async () => {
      const data = list([int(1), int(2), int(3), int(4)]);
      const args: CommandArg[] = [{ _tag: "Positional", value: "2" }];

      const result = await getFirst(args, pipelineValue(data));
      const output = result.stdout;

      expect(output._tag).toBe("Value");
      if (output._tag === "Value" && output.value._tag === "List") {
        expect(output.value.items).toHaveLength(2);
      }
    });
  });

  describe("last", () => {
    test("returns last n items", async () => {
      const data = list([int(1), int(2), int(3), int(4)]);
      const args: CommandArg[] = [{ _tag: "Positional", value: "2" }];

      const result = await getLast(args, pipelineValue(data));
      const output = result.stdout;

      expect(output._tag).toBe("Value");
      if (output._tag === "Value" && output.value._tag === "List") {
        expect(output.value.items).toHaveLength(2);
      }
    });
  });

  describe("flatten", () => {
    test("flattens nested lists", async () => {
      const data = list([
        list([int(1), int(2)]),
        list([int(3), int(4)]),
      ]);
      const args: CommandArg[] = [];

      const result = await flattenList(args, pipelineValue(data));
      const output = result.stdout;

      expect(output._tag).toBe("Value");
      if (output._tag === "Value" && output.value._tag === "List") {
        expect(output.value.items).toHaveLength(4);
      }
    });
  });

  describe("unique", () => {
    test("returns unique items", async () => {
      const data = list([int(1), int(2), int(2), int(3)]);
      const args: CommandArg[] = [];

      const result = await uniqueItems(args, pipelineValue(data));
      const output = result.stdout;

      expect(output._tag).toBe("Value");
      if (output._tag === "Value" && output.value._tag === "List") {
        expect(output.value.items).toHaveLength(3);
      }
    });
  });

  describe("reverse", () => {
    test("reverses list", async () => {
      const data = list([int(1), int(2), int(3)]);
      const args: CommandArg[] = [];

      const result = await reverseItems(args, pipelineValue(data));
      const output = result.stdout;

      expect(output._tag).toBe("Value");
      if (output._tag === "Value" && output.value._tag === "List") {
        expect(toString(output.value.items[0]!)).toBe("3");
        expect(toString(output.value.items[2]!)).toBe("1");
      }
    });
  });
});
