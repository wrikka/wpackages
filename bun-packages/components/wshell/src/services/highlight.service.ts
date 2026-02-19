/**
 * Syntax Highlighting for wshell REPL
 * Colorized command syntax
 */
import type { Token } from "../types/command.types";
import { tokenize } from "../lib/parser";
import { Effect } from "effect";

// Color codes
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  // Token colors
  command: "\x1b[32m",    // Green
  string: "\x1b[33m",     // Yellow
  number: "\x1b[36m",     // Cyan
  keyword: "\x1b[35m",    // Magenta
  operator: "\x1b[34m",   // Blue
  flag: "\x1b[90m",       // Gray
  variable: "\x1b[31m",   // Red
  comment: "\x1b[90m",    // Gray (dim)
};

// Token type to color mapping
const tokenColors: Record<string, string> = {
  Word: colors.command,
  String: colors.string,
  Number: colors.number,
  Pipe: colors.operator,
  And: colors.keyword,
  Or: colors.keyword,
  RedirectOut: colors.operator,
  RedirectAppend: colors.operator,
  RedirectIn: colors.operator,
  Flag: colors.flag,
  Dollar: colors.variable,
  Semicolon: colors.operator,
};

// Highlight a command string
export async function highlight(input: string): Promise<string> {
  try {
    const tokens = await Effect.runPromise(tokenize(input));
    let result = "";
    let lastEnd = 0;
    
    for (const token of tokens) {
      if (token.type === "Eof") continue;
      
      // Add any text between tokens
      if (token.position > lastEnd) {
        result += input.slice(lastEnd, token.position);
      }
      
      // Get color for token
      const color = tokenColors[token.type] || colors.reset;
      
      // Special handling for flags (words starting with -)
      if (token.type === "Word" && token.value.startsWith("-")) {
        result += colors.flag + token.value + colors.reset;
      } else {
        result += color + token.value + colors.reset;
      }
      
      lastEnd = token.position + token.value.length;
    }
    
    // Add remaining text
    if (lastEnd < input.length) {
      result += input.slice(lastEnd);
    }
    
    return result;
  } catch {
    // Return unhighlighted on error
    return input;
  }
}

// Highlight with specific theme
export function highlightWithTheme(input: string, theme: Theme): string {
  // Theme-based highlighting (simplified)
  return highlight(input);
}

// Theme definition
export interface Theme {
  name: string;
  colors: {
    command: string;
    string: string;
    number: string;
    keyword: string;
    operator: string;
    flag: string;
    variable: string;
    comment: string;
  };
}

// Default themes
export const themes: Record<string, Theme> = {
  default: {
    name: "Default",
    colors: {
      command: "\x1b[32m",
      string: "\x1b[33m",
      number: "\x1b[36m",
      keyword: "\x1b[35m",
      operator: "\x1b[34m",
      flag: "\x1b[90m",
      variable: "\x1b[31m",
      comment: "\x1b[90m",
    },
  },
  dark: {
    name: "Dark",
    colors: {
      command: "\x1b[92m",
      string: "\x1b[93m",
      number: "\x1b[96m",
      keyword: "\x1b[95m",
      operator: "\x1b[94m",
      flag: "\x1b[37m",
      variable: "\x1b[91m",
      comment: "\x1b[37m",
    },
  },
  light: {
    name: "Light",
    colors: {
      command: "\x1b[32m",
      string: "\x1b[33m",
      number: "\x1b[34m",
      keyword: "\x1b[35m",
      operator: "\x1b[36m",
      flag: "\x1b[90m",
      variable: "\x1b[31m",
      comment: "\x1b[90m",
    },
  },
};

// Current theme
let currentTheme: Theme = themes.default;

export function setTheme(themeName: string): boolean {
  const theme = themes[themeName];
  if (theme) {
    currentTheme = theme;
    return true;
  }
  return false;
}

export function getTheme(): Theme {
  return currentTheme;
}

export function getAvailableThemes(): string[] {
  return Object.keys(themes);
}
