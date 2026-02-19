/**
 * Data slicing filters - first, last, flatten, unique
 */
import type { CommandArg, CommandResult } from "../types/command.types";
import type { PipelineData, ShellValue } from "../types";
import { pipelineEmpty, pipelineValue, collectToValue } from "../types/pipeline.types";
import { isList, isTable, list, table, toString } from "../types/value.types";

/** Type guard for positional args */
function isPositionalArg(arg: CommandArg): arg is { _tag: "Positional"; value: string } {
  return arg._tag === "Positional";
}

/** first - get first n items */
export async function getFirst(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);
  const positional = args.find(isPositionalArg);
  const n = Number.parseInt(positional?.value ?? "1", 10);

  if (isList(value)) {
    return { stdout: pipelineValue(list(value.items.slice(0, n))), stderr: pipelineEmpty(), exitCode: 0 };
  }

  if (isTable(value)) {
    return { stdout: pipelineValue(table(value.headers, value.rows.slice(0, n))), stderr: pipelineEmpty(), exitCode: 0 };
  }

  return { stdout: pipelineValue(value), stderr: pipelineEmpty(), exitCode: 0 };
}

/** last - get last n items */
export async function getLast(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);
  const positional = args.find(isPositionalArg);
  const n = Number.parseInt(positional?.value ?? "1", 10);

  if (isList(value)) {
    return { stdout: pipelineValue(list(value.items.slice(-n))), stderr: pipelineEmpty(), exitCode: 0 };
  }

  if (isTable(value)) {
    return { stdout: pipelineValue(table(value.headers, value.rows.slice(-n))), stderr: pipelineEmpty(), exitCode: 0 };
  }

  return { stdout: pipelineValue(value), stderr: pipelineEmpty(), exitCode: 0 };
}

/** flatten - flatten nested lists */
export async function flattenList(
  _args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);

  if (!isList(value)) {
    return { stdout: pipelineValue(value), stderr: pipelineEmpty(), exitCode: 0 };
  }

  const all: ShellValue[] = [];
  for (const item of value.items) {
    if (isList(item)) all.push(...item.items);
    else all.push(item);
  }

  return { stdout: pipelineValue(list(all)), stderr: pipelineEmpty(), exitCode: 0 };
}

/** unique - get unique items */
export async function uniqueItems(
  _args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);

  if (!isList(value)) {
    return { stdout: pipelineValue(value), stderr: pipelineEmpty(), exitCode: 0 };
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

  return { stdout: pipelineValue(list(unique)), stderr: pipelineEmpty(), exitCode: 0 };
}
