/**
 * Data selection filters - where, select, get
 */
import type { CommandArg, CommandResult } from "../types/command.types";
import type { PipelineData, ShellValue, RecordValue, TableValue } from "../types";
import { pipelineEmpty, pipelineValue, collectToValue } from "../types/pipeline.types";
import { isList, isRecord, isTable, record, table, str, list } from "../types/value.types";
import { getValueAtPath, evaluateCondition } from "./filters.utils";

/** Type guards for args */
function isPositionalArg(arg: CommandArg): arg is { _tag: "Positional"; value: string } {
  return arg._tag === "Positional";
}

function isFlagArg(arg: CommandArg): arg is { _tag: "Flag"; name: string; value?: string } {
  return arg._tag === "Flag";
}

/** where - filter items by condition */
export async function filterWhere(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);

  if (!isList(value) && !isTable(value)) {
    return { stdout: pipelineValue(value), stderr: pipelineEmpty(), exitCode: 0 };
  }

  const positionalArgs = args.filter(isPositionalArg);
  const columnArg = positionalArgs[0]?.value;
  const operationArg = positionalArgs[1]?.value ?? "==";
  const compareValue = positionalArgs[2]?.value;

  if (!columnArg) {
    return {
      stdout: pipelineValue(value),
      stderr: pipelineValue(str("where: column not specified\n")),
      exitCode: 1,
    };
  }

  let filtered: ShellValue[] | RecordValue[];

  if (isList(value)) {
    filtered = value.items.filter((item) => {
      const cellValue = getValueAtPath(item, columnArg.split("."));
      if (!cellValue) return false;
      const cellStr = cellValue._tag === "String" ? cellValue.value : String(cellValue.value ?? "");
      return evaluateCondition(cellStr, operationArg, compareValue ?? "");
    });

    return { stdout: pipelineValue(list(filtered)), stderr: pipelineEmpty(), exitCode: 0 };
  }

  filtered = value.rows.filter((row) => {
    const cellValue = row.fields[columnArg];
    if (!cellValue) return false;
    const cellStr = cellValue._tag === "String" ? cellValue.value : String(cellValue.value ?? "");
    return evaluateCondition(cellStr, operationArg, compareValue ?? "");
  });

  return { stdout: pipelineValue(table(value.headers, filtered)), stderr: pipelineEmpty(), exitCode: 0 };
}

/** select - select specific columns */
export async function selectColumns(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);

  if (!isTable(value) && !isList(value)) {
    return { stdout: pipelineValue(value), stderr: pipelineEmpty(), exitCode: 0 };
  }

  const columns = args.filter(isPositionalArg).map((a) => a.value);

  if (columns.length === 0) {
    return { stdout: pipelineValue(value), stderr: pipelineEmpty(), exitCode: 0 };
  }

  if (isTable(value)) {
    const selectedHeaders = value.headers.filter((h) => columns.includes(h));
    const rows = value.rows.map((row) => {
      const fields: Record<string, ShellValue> = {};
      for (const col of selectedHeaders) {
        fields[col] = row.fields[col]!;
      }
      return record(fields);
    });

    return { stdout: pipelineValue(table(selectedHeaders, rows)), stderr: pipelineEmpty(), exitCode: 0 };
  }

  const items = value.items.map((item) => {
    const fields: Record<string, ShellValue> = {};
    for (const col of columns) {
      const val = getValueAtPath(item, col.split("."));
      if (val) fields[col] = val;
    }
    return record(fields);
  });

  return { stdout: pipelineValue(table(columns, items)), stderr: pipelineEmpty(), exitCode: 0 };
}

/** get - get value at cell path */
export async function getValue(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);
  const pathArg = args.find(isPositionalArg)?.value;

  if (!pathArg) {
    return { stdout: pipelineValue(value), stderr: pipelineEmpty(), exitCode: 0 };
  }

  const path = pathArg.split(".");
  const result = getValueAtPath(value, path);

  return { stdout: pipelineValue(result ?? str("")), stderr: pipelineEmpty(), exitCode: 0 };
}
