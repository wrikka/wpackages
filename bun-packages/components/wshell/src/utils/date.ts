/**
 * Date/Time Functions for wshell
 * Date manipulation commands
 */
import type { ShellValue } from "../types/value.types";
import { date, str, int, list, record } from "../types/value.types";

// Format date
export function formatDate(d: Date, format: string): string {
  const map: Record<string, string> = {
    YYYY: String(d.getFullYear()),
    MM: String(d.getMonth() + 1).padStart(2, "0"),
    DD: String(d.getDate()).padStart(2, "0"),
    HH: String(d.getHours()).padStart(2, "0"),
    mm: String(d.getMinutes()).padStart(2, "0"),
    ss: String(d.getSeconds()).padStart(2, "0"),
  };

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => map[match] || match);
}

// Parse date string
export function parseDate(dateStr: string): ShellValue {
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    return str("Error: Invalid date");
  }
  return date(parsed);
}

// Get current date/time
export function now(): ShellValue {
  return date(new Date());
}

// Date arithmetic
export function addDays(d: Date, days: number): ShellValue {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return date(result);
}

export function addHours(d: Date, hours: number): ShellValue {
  const result = new Date(d);
  result.setHours(result.getHours() + hours);
  return date(result);
}

export function addMinutes(d: Date, minutes: number): ShellValue {
  const result = new Date(d);
  result.setMinutes(result.getMinutes() + minutes);
  return date(result);
}

// Date diff
export function dateDiff(d1: Date, d2: Date, unit: "days" | "hours" | "minutes" | "seconds" = "days"): ShellValue {
  const msDiff = d2.getTime() - d1.getTime();
  
  const multipliers = {
    days: 1000 * 60 * 60 * 24,
    hours: 1000 * 60 * 60,
    minutes: 1000 * 60,
    seconds: 1000,
  };
  
  const diff = msDiff / multipliers[unit];
  return { _tag: "Float", value: diff } as const;
}

// Date info
export function dateInfo(d: Date): ShellValue {
  return record({
    year: { _tag: "Int", value: BigInt(d.getFullYear()) } as const,
    month: { _tag: "Int", value: BigInt(d.getMonth() + 1) } as const,
    day: { _tag: "Int", value: BigInt(d.getDate()) } as const,
    hour: { _tag: "Int", value: BigInt(d.getHours()) } as const,
    minute: { _tag: "Int", value: BigInt(d.getMinutes()) } as const,
    second: { _tag: "Int", value: BigInt(d.getSeconds()) } as const,
    weekday: str(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()] || ""),
    iso: str(d.toISOString()),
    timestamp: { _tag: "Int", value: BigInt(d.getTime()) } as const,
  });
}

// List of all date functions
export const dateFunctions = {
  now,
  parse: parseDate,
  format: formatDate,
  addDays,
  addHours,
  addMinutes,
  diff: dateDiff,
  info: dateInfo,
};
