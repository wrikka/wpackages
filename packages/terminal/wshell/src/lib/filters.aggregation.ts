/**
 * Data aggregation filters - group-by, length, count
 */
import type { CommandArg, CommandResult } from "../types/command.types";
import type { PipelineData } from "../types";
import { pipelineEmpty, pipelineValue, collectToValue } from "../types/pipeline.types";
import { isList, isTable, isRecord, record, list, str, toString } from "../types/value.types";

/** Type guard for positional args */
function isPositionalArg(arg: CommandArg): arg is { _tag: "Positional"; value: string } {
  return arg._tag === "Positional";
}

/** group-by - group items by column value */
export async function groupBy(
  args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);

  if (!isList(value) && !isTable(value)) {
    return { stdout: pipelineValue(value), stderr: pipelineEmpty(), exitCode: 0 };
  }

  const column = args.find(isPositionalArg)?.value;

  if (!column) {
    return {
      stdout: pipelineValue(value),
      stderr: pipelineValue(str("group-by: column not specified\n")),
      exitCode: 1,
    };
  }

  const items = isTable(value) ? value.rows : value.items;
  const groups = new Map<string, unknown[]>();

  for (const item of items) {
    let key: string;
    if (isRecord(item)) {
      const keyValue = item.fields[column];
      key = keyValue ? toString(keyValue) : "";
    } else {
      key = toString(item as { _tag: string; value?: unknown });
    }

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  const fields: Record<string, { _tag: "List"; items: unknown[] }> = {};
  for (const [key, groupItems] of groups) {
    fields[key] = list(groupItems as { _tag: string; value?: unknown }[]);
  }

  return { stdout: pipelineValue(record(fields)), stderr: pipelineEmpty(), exitCode: 0 };
}

/** length/count - get count of items */
export async function getLength(
  _args: readonly CommandArg[],
  input: PipelineData
): Promise<CommandResult> {
  const value = await collectToValue(input);
  let count = 0;

  if (isList(value)) count = value.items.length;
  else if (isTable(value)) count = value.rows.length;
  else if (isRecord(value)) count = value.fieldNames.length;
  else if (value._tag !== "Null") count = 1;

  return {
    stdout: pipelineValue({ _tag: "Int", value: BigInt(count) }),
    stderr: pipelineEmpty(),
    exitCode: 0,
  };
}
