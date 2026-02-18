/**
 * Data ordering filters - sort, reverse
 */
import type { CommandArg, CommandResult } from "../types/command.types";
import type { PipelineData, ShellValue, RecordValue } from "../types";
import { pipelineEmpty, pipelineValue, collectToValue } from "../types/pipeline.types";
import { isList, isTable, record, table, list } from "../types/value.types";
import { compareValues, extractCellValue } from "./filters.utils";

/** Type guards */
function isPositionalArg(arg: CommandArg): arg is { _tag: "Positional"; value: string } {
  return arg._tag === "Positional";
}

function isFlagArg(arg: CommandArg): arg is { _tag: "Flag"; name: string; value?: string } {
  return arg._tag === "Flag";
}

/** sort - sort items by column */
export async function sortBy(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);

  if (!isList(value) && !isTable(value)) {
    return { stdout: pipelineValue(value), stderr: pipelineEmpty(), exitCode: 0 };
  }

  const column = args.find(isPositionalArg)?.value;
  const reverse = args.some(isFlagArg) && args.some((a) => a._tag === "Flag" && a.name === "reverse");

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
    const valA = extractCellValue(a as { _tag: string; value?: unknown }, column, isTableResult);
    const valB = extractCellValue(b as { _tag: string; value?: unknown }, column, isTableResult);
    return compareValues(valA, valB, reverse);
  });

  if (isTableResult) {
    return { stdout: pipelineValue(table(headers, items as RecordValue[])), stderr: pipelineEmpty(), exitCode: 0 };
  }
  return { stdout: pipelineValue(list(items as ShellValue[])), stderr: pipelineEmpty(), exitCode: 0 };
}

/** reverse - reverse items order */
export async function reverseItems(
  _args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);

  if (isList(value)) {
    return { stdout: pipelineValue(list([...value.items].reverse())), stderr: pipelineEmpty(), exitCode: 0 };
  }

  if (isTable(value)) {
    return { stdout: pipelineValue(table(value.headers, [...value.rows].reverse())), stderr: pipelineEmpty(), exitCode: 0 };
  }

  return { stdout: pipelineValue(value), stderr: pipelineEmpty(), exitCode: 0 };
}
