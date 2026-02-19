/**
 * Data filter commands - inspired by Nushell's structured data processing
 * Provides: where, select, get, each, sort, group-by, etc.
 */
import type { CommandArg, CommandContext, CommandResult } from "../types/command.types";
import type { PipelineData } from "../types/pipeline.types";
import { pipelineEmpty, pipelineValue, collectToValue, isValue, isListStream, isTableStream } from "../types/pipeline.types";
import { isList, isRecord, isTable, str, record, table, list, bool, toString } from "../types/value.types";
import type { RecordValue, ShellValue, TableValue } from "../types/value.types";

// Helper to get value at cell path
function getValueAtPath(value: ShellValue, path: string[]): ShellValue | undefined {
  let current: ShellValue = value;
  
  for (const key of path) {
    if (isRecord(current)) {
      current = current.fields[key]!;
    } else if (isList(current)) {
      const index = parseInt(key, 10);
      if (!isNaN(index) && index >= 0 && index < current.items.length) {
        current = current.items[index]!;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }
  
  return current;
}

// where - filter based on condition
export async function filterWhere(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);
  
  if (!isList(value) && !isTable(value)) {
    return {
      stdout: pipelineValue(value),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  }

  // Get column and value to filter by
  const columnArg = args.find((a): a is { _tag: "Positional" } => a._tag === "Positional")?.value;
  const operationArg = args.filter((a): a is { _tag: "Positional" } => a._tag === "Positional")[1]?.value ?? "==";
  const compareValue = args.filter((a): a is { _tag: "Positional" } => a._tag === "Positional")[2]?.value;

  if (!columnArg) {
    return {
      stdout: pipelineValue(value),
      stderr: pipelineValue(str("where: column not specified\n")),
      exitCode: 1,
    };
  }

  let filtered: ShellValue[] | RecordValue[];

  if (isList(value)) {
    filtered = value.items.filter(item => {
      const cellValue = getValueAtPath(item, columnArg.split("."));
      if (!cellValue) return false;
      
      const cellStr = toString(cellValue);
      return evaluateCondition(cellStr, operationArg, compareValue ?? "");
    });
    
    return {
      stdout: pipelineValue(list(filtered)),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  } else {
    filtered = value.rows.filter(row => {
      const cellValue = row.fields[columnArg];
      if (!cellValue) return false;
      
      const cellStr = toString(cellValue);
      return evaluateCondition(cellStr, operationArg, compareValue ?? "");
    });
    
    return {
      stdout: pipelineValue(table(value.headers, filtered)),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  }
}

// Helper for condition evaluation
function evaluateCondition(left: string, op: string, right: string): boolean {
  const leftNum = parseFloat(left);
  const rightNum = parseFloat(right);
  const isNumeric = !isNaN(leftNum) && !isNaN(rightNum);

  switch (op) {
    case "==": return left === right;
    case "!=": return left !== right;
    case ">": return isNumeric ? leftNum > rightNum : left > right;
    case ">=": return isNumeric ? leftNum >= rightNum : left >= right;
    case "<": return isNumeric ? leftNum < rightNum : left < right;
    case "<=": return isNumeric ? leftNum <= rightNum : left <= right;
    case "=~": return new RegExp(right).test(left);
    case "!~": return !new RegExp(right).test(left);
    default: return left === right;
  }
}

// select - select specific columns
export async function selectColumns(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);
  
  if (!isTable(value) && !isList(value)) {
    return {
      stdout: pipelineValue(value),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  }

  const columns = args
    .filter((a): a is { _tag: "Positional" } => a._tag === "Positional")
    .map(a => a.value);

  if (columns.length === 0) {
    return {
      stdout: pipelineValue(value),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  }

  if (isTable(value)) {
    const selectedHeaders = value.headers.filter(h => columns.includes(h));
    const rows = value.rows.map(row => {
      const fields: Record<string, ShellValue> = {};
      for (const col of selectedHeaders) {
        fields[col] = row.fields[col]!;
      }
      return record(fields);
    });
    
    return {
      stdout: pipelineValue(table(selectedHeaders, rows)),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  } else {
    // For lists, try to get nested values
    const items = value.items.map(item => {
      const fields: Record<string, ShellValue> = {};
      for (const col of columns) {
        const val = getValueAtPath(item, col.split("."));
        if (val) {
          fields[col] = val;
        }
      }
      return record(fields);
    });
    
    return {
      stdout: pipelineValue(table(columns, items)),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  }
}

// get - get value at cell path
export async function getValue(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);
  
  const pathArg = args.find((a): a is { _tag: "Positional" } => a._tag === "Positional")?.value;
  
  if (!pathArg) {
    return {
      stdout: pipelineValue(value),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  }

  const path = pathArg.split(".");
  const result = getValueAtPath(value, path);

  return {
    stdout: pipelineValue(result ?? str("")),
    stderr: pipelineEmpty(),
    exitCode: 0,
  };
}

// each - iterate and transform each item
export async function eachItem(
  args: readonly CommandArg[],
  input: PipelineData,
  transform: (item: ShellValue, index: number) => ShellValue | Promise<ShellValue>
): Promise<CommandResult> {
  const value = await collectToValue(input);
  
  if (!isList(value) && !isTable(value)) {
    const transformed = await transform(value, 0);
    return {
      stdout: pipelineValue(transformed),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  }

  const items = isTable(value) ? value.rows : value.items;
  const transformed = await Promise.all(
    items.map((item, i) => transform(item, i))
  );

  return {
    stdout: pipelineValue(list(transformed)),
    stderr: pipelineEmpty(),
    exitCode: 0,
  };
}

// sort - sort items by column
export async function sortBy(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);
  
  if (!isList(value) && !isTable(value)) {
    return {
      stdout: pipelineValue(value),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  }

  const column = args.find((a): a is { _tag: "Positional" } => a._tag === "Positional")?.value;
  const reverse = args.some((a): a is { _tag: "Flag" } => a._tag === "Flag" && a.name === "reverse");

  let items: ShellValue[] | RecordValue[];
  let isTableResult = false;
  let headers: string[] = [];

  if (isTable(value)) {
    items = [...value.rows];
    isTableResult = true;
    headers = [...value.headers];
  } else {
    items = [...value.items];
  }

  items.sort((a, b) => {
    let valA: string, valB: string;
    
    if (isTableResult && column) {
      valA = toString((a as RecordValue).fields[column] ?? str(""));
      valB = toString((b as RecordValue).fields[column] ?? str(""));
    } else {
      valA = toString(a as ShellValue);
      valB = toString(b as ShellValue);
    }

    // Try numeric comparison
    const numA = parseFloat(valA);
    const numB = parseFloat(valB);
    if (!isNaN(numA) && !isNaN(numB)) {
      return reverse ? numB - numA : numA - numB;
    }

    return reverse ? valB.localeCompare(valA) : valA.localeCompare(valB);
  });

  if (isTableResult) {
    return {
      stdout: pipelineValue(table(headers, items as RecordValue[])),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  } else {
    return {
      stdout: pipelineValue(list(items as ShellValue[])),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  }
}

// group-by - group items by column
export async function groupBy(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);
  
  if (!isList(value) && !isTable(value)) {
    return {
      stdout: pipelineValue(value),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  }

  const column = args.find((a): a is { _tag: "Positional" } => a._tag === "Positional")?.value;
  
  if (!column) {
    return {
      stdout: pipelineValue(value),
      stderr: pipelineValue(str("group-by: column not specified\n")),
      exitCode: 1,
    };
  }

  const items = isTable(value) ? value.rows : value.items;
  const groups = new Map<string, ShellValue[]>();

  for (const item of items) {
    let key: string;
    if (isRecord(item)) {
      key = toString(item.fields[column] ?? str(""));
    } else {
      key = toString(item as ShellValue);
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }

  // Create grouped record
  const fields: Record<string, ShellValue> = {};
  for (const [key, groupItems] of groups) {
    fields[key] = list(groupItems);
  }

  return {
    stdout: pipelineValue(record(fields)),
    stderr: pipelineEmpty(),
    exitCode: 0,
  };
}

// length/count - get count of items
export async function getLength(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);
  let count = 0;

  if (isList(value)) {
    count = value.items.length;
  } else if (isTable(value)) {
    count = value.rows.length;
  } else if (isRecord(value)) {
    count = value.fieldNames.length;
  } else if (value._tag !== "Null") {
    count = 1;
  }

  return {
    stdout: pipelineValue({ _tag: "Int", value: BigInt(count) }),
    stderr: pipelineEmpty(),
    exitCode: 0,
  };
}

// first - get first n items
export async function getFirst(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);
  const n = parseInt(args.find((a): a is { _tag: "Positional" } => a._tag === "Positional")?.value ?? "1", 10);

  if (isList(value)) {
    return {
      stdout: pipelineValue(list(value.items.slice(0, n))),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  } else if (isTable(value)) {
    return {
      stdout: pipelineValue(table(value.headers, value.rows.slice(0, n))),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  }

  return {
    stdout: pipelineValue(value),
    stderr: pipelineEmpty(),
    exitCode: 0,
  };
}

// last - get last n items
export async function getLast(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);
  const n = parseInt(args.find((a): a is { _tag: "Positional" } => a._tag === "Positional")?.value ?? "1", 10);

  if (isList(value)) {
    return {
      stdout: pipelineValue(list(value.items.slice(-n))),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  } else if (isTable(value)) {
    return {
      stdout: pipelineValue(table(value.headers, value.rows.slice(-n))),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  }

  return {
    stdout: pipelineValue(value),
    stderr: pipelineEmpty(),
    exitCode: 0,
  };
}

// flatten - flatten nested lists
export async function flattenList(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);

  if (!isList(value)) {
    return {
      stdout: pipelineValue(value),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  }

  const all: ShellValue[] = [];
  for (const item of value.items) {
    if (isList(item)) {
      all.push(...item.items);
    } else {
      all.push(item);
    }
  }

  return {
    stdout: pipelineValue(list(all)),
    stderr: pipelineEmpty(),
    exitCode: 0,
  };
}

// unique - get unique items
export async function uniqueItems(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);

  if (!isList(value)) {
    return {
      stdout: pipelineValue(value),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  }

  const seen = new Set<string>();
  const unique: ShellValue[] = [];

  for (const item of value.items) {
    const key = toString(item);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  return {
    stdout: pipelineValue(list(unique)),
    stderr: pipelineEmpty(),
    exitCode: 0,
  };
}

// reverse - reverse items
export async function reverseItems(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);

  if (isList(value)) {
    return {
      stdout: pipelineValue(list([...value.items].reverse())),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  } else if (isTable(value)) {
    return {
      stdout: pipelineValue(table(value.headers, [...value.rows].reverse())),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  }

  return {
    stdout: pipelineValue(value),
    stderr: pipelineEmpty(),
    exitCode: 0,
  };
}
