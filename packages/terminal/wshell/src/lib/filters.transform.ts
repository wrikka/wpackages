/**
 * Data transformation filters - each, map, transform
 */
import type { CommandArg, CommandResult } from "../types/command.types";
import type { PipelineData, ShellValue } from "../types";
import { pipelineEmpty, pipelineValue, collectToValue } from "../types/pipeline.types";
import { isList, isTable, list } from "../types/value.types";

/** each - iterate and transform each item */
export async function eachItem(
  _args: readonly CommandArg[],
  input: PipelineData,
  transform?: (item: ShellValue, index: number) => ShellValue | Promise<ShellValue>
): Promise<CommandResult> {
  const value = await collectToValue(input);

  if (!transform) {
    return { stdout: pipelineValue(value), stderr: pipelineEmpty(), exitCode: 0 };
  }

  if (!isList(value) && !isTable(value)) {
    const transformed = await transform(value, 0);
    return { stdout: pipelineValue(transformed), stderr: pipelineEmpty(), exitCode: 0 };
  }

  const items = isTable(value) ? value.rows : value.items;
  const transformed = await Promise.all(items.map((item, i) => transform(item, i)));

  return { stdout: pipelineValue(list(transformed)), stderr: pipelineEmpty(), exitCode: 0 };
}

/** map - alias for each with better semantics */
export async function mapItems(
  args: readonly CommandArg[],
  input: PipelineData,
  transform?: (item: ShellValue, index: number) => ShellValue | Promise<ShellValue>
): Promise<CommandResult> {
  return eachItem(args, input, transform);
}
