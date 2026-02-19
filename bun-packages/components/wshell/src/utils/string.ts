/**
 * String Operations for wshell
 * Advanced string processing
 */
import type { ShellValue, ListValue } from "../types/value.types";
import { str, list, int, bool } from "../types/value.types";

// String manipulation functions
export const stringOps = {
  // Length
  length: (s: string): ShellValue => {
    return { _tag: "Int", value: BigInt(s.length) } as const;
  },

  // Uppercase
  upper: (s: string): ShellValue => str(s.toUpperCase()),

  // Lowercase
  lower: (s: string): ShellValue => str(s.toLowerCase()),

  // Trim
  trim: (s: string): ShellValue => str(s.trim()),

  // Split
  split: (s: string, delimiter: string): ListValue => {
    return list(s.split(delimiter).map(part => str(part)));
  },

  // Join
  join: (parts: string[], separator: string): ShellValue => {
    return str(parts.join(separator));
  },

  // Replace
  replace: (s: string, search: string, replace: string): ShellValue => {
    return str(s.split(search).join(replace));
  },

  // Replace regex
  replaceRegex: (s: string, pattern: string, replace: string): ShellValue => {
    try {
      return str(s.replace(new RegExp(pattern, "g"), replace));
    } catch {
      return str(s);
    }
  },

  // Contains
  contains: (s: string, search: string): ShellValue => {
    return { _tag: "Bool", value: s.includes(search) } as const;
  },

  // Starts with
  startsWith: (s: string, prefix: string): ShellValue => {
    return { _tag: "Bool", value: s.startsWith(prefix) } as const;
  },

  // Ends with
  endsWith: (s: string, suffix: string): ShellValue => {
    return { _tag: "Bool", value: s.endsWith(suffix) } as const;
  },

  // Index of
  indexOf: (s: string, search: string): ShellValue => {
    return { _tag: "Int", value: BigInt(s.indexOf(search)) } as const;
  },

  // Substring
  substring: (s: string, start: number, end?: number): ShellValue => {
    return str(s.substring(start, end));
  },

  // Pad start
  padStart: (s: string, length: number, padString: string = " "): ShellValue => {
    return str(s.padStart(length, padString));
  },

  // Pad end
  padEnd: (s: string, length: number, padString: string = " "): ShellValue => {
    return str(s.padEnd(length, padString));
  },

  // Reverse
  reverse: (s: string): ShellValue => {
    return str(s.split("").reverse().join(""));
  },

  // Match regex
  match: (s: string, pattern: string): ListValue => {
    try {
      const matches = s.match(new RegExp(pattern, "g")) || [];
      return list(matches.map(m => str(m)));
    } catch {
      return list([]);
    }
  },

  // Extract with regex
  extract: (s: string, pattern: string): ShellValue => {
    try {
      const match = s.match(new RegExp(pattern));
      if (match && match[1]) {
        return str(match[1]);
      }
      return str("");
    } catch {
      return str("");
    }
  },

  // Word count
  wordCount: (s: string): ShellValue => {
    const words = s.trim().split(/\s+/).filter(w => w.length > 0);
    return { _tag: "Int", value: BigInt(words.length) } as const;
  },

  // Line count
  lineCount: (s: string): ShellValue => {
    const lines = s.split("\n");
    return { _tag: "Int", value: BigInt(lines.length) } as const;
  },

  // Base64 encode
  base64Encode: (s: string): ShellValue => {
    return str(Buffer.from(s).toString("base64"));
  },

  // Base64 decode
  base64Decode: (s: string): ShellValue => {
    try {
      return str(Buffer.from(s, "base64").toString("utf-8"));
    } catch {
      return str("Error: Invalid base64");
    }
  },
};
