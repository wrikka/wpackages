/**
 * Register data filter commands with the executor
 */
import { registerBuiltin } from "./executor.service";
import {
  filterWhere,
  selectColumns,
  getValue,
  eachItem,
  sortBy,
  groupBy,
  getLength,
  getFirst,
  getLast,
  flattenList,
  uniqueItems,
  reverseItems,
} from "./filters.service";
import { pipelineEmpty, collectToValue } from "../types/pipeline.types";
import { str, record, table, list, isRecord } from "../types/value.types";
import type { CommandArg, CommandContext, CommandResult } from "../types/command.types";

export function registerFilterCommands(): void {
  // where - filter items by condition
  registerBuiltin("where", async (args, ctx) => {
    return filterWhere(args, ctx.stdin);
  });

  // select - select columns
  registerBuiltin("select", async (args, ctx) => {
    return selectColumns(args, ctx.stdin);
  });

  // get - get value at path
  registerBuiltin("get", async (args, ctx) => {
    return getValue(args, ctx.stdin);
  });

  // each - iterate over items
  registerBuiltin("each", async (args, ctx) => {
    // For now, just return items as-is (can be extended with closures)
    const { isList, isTable, list } = await import("../types/value.types");
    const value = await collectToValue(ctx.stdin);
    
    if (isList(value)) {
      return {
        stdout: pipelineEmpty(),
        stderr: pipelineEmpty(),
        exitCode: 0,
      };
    } else if (isTable(value)) {
      return {
        stdout: pipelineEmpty(),
        stderr: pipelineEmpty(),
        exitCode: 0,
      };
    }
    
    return {
      stdout: pipelineEmpty(),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  });

  // sort-by - sort items
  registerBuiltin("sort-by", async (args, ctx) => {
    return sortBy(args, ctx.stdin);
  });

  registerBuiltin("sort", async (args, ctx) => {
    return sortBy(args, ctx.stdin);
  });

  // group-by - group items
  registerBuiltin("group-by", async (args, ctx) => {
    return groupBy(args, ctx.stdin);
  });

  // length - count items
  registerBuiltin("length", async (args, ctx) => {
    return getLength(args, ctx.stdin);
  });

  registerBuiltin("count", async (args, ctx) => {
    return getLength(args, ctx.stdin);
  });

  // first - get first n items
  registerBuiltin("first", async (args, ctx) => {
    return getFirst(args, ctx.stdin);
  });

  // last - get last n items
  registerBuiltin("last", async (args, ctx) => {
    return getLast(args, ctx.stdin);
  });

  // flatten - flatten nested lists
  registerBuiltin("flatten", async (args, ctx) => {
    return flattenList(args, ctx.stdin);
  });

  // unique - get unique items
  registerBuiltin("unique", async (args, ctx) => {
    return uniqueItems(args, ctx.stdin);
  });

  // reverse - reverse items
  registerBuiltin("reverse", async (args, ctx) => {
    return reverseItems(args, ctx.stdin);
  });

  // table - convert to table format
  registerBuiltin("table", async (args, ctx) => {
    const { collectToValue } = await import("../types/pipeline.types");
    const { isList, isRecord, table, str } = await import("../types/value.types");
    
    const value = await collectToValue(ctx.stdin);
    
    if (isList(value)) {
      // Infer headers from first record
      let headers: string[] = [];
      const firstItem = value.items[0];
      
      if (firstItem && isRecord(firstItem)) {
        headers = firstItem.fieldNames;
      } else {
        headers = ["value"];
      }
      
      const rows = value.items.map(item => {
        if (isRecord(item)) {
          return item;
        }
        return record({ value: item });
      });
      
      return {
        stdout: str(JSON.stringify(value, null, 2)),
        stderr: pipelineEmpty(),
        exitCode: 0,
      };
    }
    
    return {
      stdout: str(JSON.stringify(value, null, 2)),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  });

  // from - parse data formats
  registerBuiltin("from-json", async (args, ctx) => {
    const value = await collectToValue(ctx.stdin);
    const jsonStr = value._tag === "String" ? value.value : 
                   value._tag === "Binary" ? new TextDecoder().decode(value.data) :
                   JSON.stringify(value);
    
    try {
      const parsed = JSON.parse(jsonStr);
      const converted = convertToShellValue(parsed);
      return {
        stdout: { _tag: "Value", value: converted },
        stderr: pipelineEmpty(),
        exitCode: 0,
      };
    } catch (error) {
      return {
        stdout: pipelineEmpty(),
        stderr: str(`from-json: ${error}\n`),
        exitCode: 1,
      };
    }
  });

  registerBuiltin("from-csv", async (args, ctx) => {
    const value = await collectToValue(ctx.stdin);
    const csvStr = value._tag === "String" ? value.value :
                  value._tag === "Binary" ? new TextDecoder().decode(value.data) :
                  "";
    
    try {
      const lines = csvStr.split("\n").filter(l => l.trim());
      if (lines.length === 0) {
        return {
          stdout: { _tag: "Value", value: table([], []) },
          stderr: pipelineEmpty(),
          exitCode: 0,
        };
      }

      const delimiter = ",";
      const headers = parseCSVLine(lines[0]!, delimiter);
      const rows = lines.slice(1).map(line => {
        const values = parseCSVLine(line, delimiter);
        const fields: Record<string, typeof str> = {};
        headers.forEach((header, i) => {
          fields[header] = str(values[i] ?? "");
        });
        return record(fields);
      });

      return {
        stdout: { _tag: "Value", value: table(headers, rows) },
        stderr: pipelineEmpty(),
        exitCode: 0,
      };
    } catch (error) {
      return {
        stdout: pipelineEmpty(),
        stderr: str(`from-csv: ${error}\n`),
        exitCode: 1,
      };
    }
  });

  // to - convert to data formats
  registerBuiltin("to-json", async (args, ctx) => {
    const { toJSON } = await import("../types/value.types");
    const value = await collectToValue(ctx.stdin);
    const json = JSON.stringify(toJSON(value), null, 2);
    
    return {
      stdout: str(json + "\n"),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  });

  registerBuiltin("to-csv", async (args, ctx) => {
    const { isTable, toString } = await import("../types/value.types");
    const value = await collectToValue(ctx.stdin);
    
    if (!isTable(value)) {
      return {
        stdout: str(""),
        stderr: str("to-csv: input must be a table\n"),
        exitCode: 1,
      };
    }

    const lines: string[] = [value.headers.join(",")];
    
    for (const row of value.rows) {
      const values = value.headers.map(h => {
        const cell = row.fields[h];
        const strVal = cell ? toString(cell) : "";
        // Escape if needed
        if (strVal.includes(",") || strVal.includes('"')) {
          return `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      });
      lines.push(values.join(","));
    }

    return {
      stdout: str(lines.join("\n") + "\n"),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  });
}

// Helper to convert parsed JSON to ShellValue
function convertToShellValue(data: unknown): import("../types/value.types").ShellValue {
  const { int, float, str, bool, nil, list, record, binary } = require("../types/value.types");
  
  if (data === null) return nil();
  if (data === undefined) return nil();
  if (typeof data === "boolean") return bool(data);
  if (typeof data === "number") {
    if (Number.isInteger(data)) {
      return int(BigInt(data));
    }
    return float(data);
  }
  if (typeof data === "string") return str(data);
  if (data instanceof Uint8Array) return binary(data);
  if (Array.isArray(data)) {
    return list(data.map(convertToShellValue));
  }
  if (typeof data === "object") {
    const fields: Record<string, import("../types/value.types").ShellValue> = {};
    for (const [key, val] of Object.entries(data)) {
      fields[key] = convertToShellValue(val);
    }
    return record(fields);
  }
  
  return str(String(data));
}

// Helper to parse CSV line
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]!;
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}
