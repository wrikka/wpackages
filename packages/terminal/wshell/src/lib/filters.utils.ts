/**
 * Filter utilities and helpers
 * Shared functions for data filtering operations
 */
import type { ShellValue, RecordValue } from "../types/value.types";
import { isRecord, isList, toString } from "../types/value.types";

/** Get value at cell path (e.g., "user.name" or "items.0") */
export function getValueAtPath(value: ShellValue, path: string[]): ShellValue | undefined {
  let current: ShellValue = value;

  for (const key of path) {
    if (isRecord(current)) {
      current = current.fields[key]!;
    } else if (isList(current)) {
      const index = Number.parseInt(key, 10);
      if (!Number.isNaN(index) && index >= 0 && index < current.items.length) {
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

/** Evaluate condition for filter operations */
export function evaluateCondition(left: string, op: string, right: string): boolean {
  const leftNum = Number.parseFloat(left);
  const rightNum = Number.parseFloat(right);
  const isNumeric = !Number.isNaN(leftNum) && !Number.isNaN(rightNum);

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

/** Compare two values for sorting */
export function compareValues(a: string, b: string, reverse = false): number {
  const numA = Number.parseFloat(a);
  const numB = Number.parseFloat(b);

  if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
    return reverse ? numB - numA : numA - numB;
  }

  return reverse ? b.localeCompare(a) : a.localeCompare(b);
}

/** Extract cell value from record or item */
export function extractCellValue(
  item: ShellValue | RecordValue,
  column: string | undefined,
  isTable = false
): string {
  if (isTable && column) {
    const record = item as RecordValue;
    return record.fields[column] ? toString(record.fields[column]) : "";
  }
  return toString(item as ShellValue);
}
