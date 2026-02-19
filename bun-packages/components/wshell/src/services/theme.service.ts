/**
 * Theme System for wshell
 * Customizable color themes
 */
import type { ShellValue } from "../types/value.types";
import { record, str, list } from "../types/value.types";

// Color definition
export interface ColorScheme {
  // UI colors
  background: string;
  foreground: string;
  cursor: string;
  selection: string;
  
  // Syntax colors
  command: string;
  string: string;
  number: string;
  keyword: string;
  operator: string;
  flag: string;
  variable: string;
  comment: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  
  // Prompt colors
  prompt: string;
  gitClean: string;
  gitDirty: string;
  path: string;
}

// Theme definition
export interface Theme {
  name: string;
  description: string;
  dark: boolean;
  colors: ColorScheme;
}

// Built-in themes
export const themes: Record<string, Theme> = {
  default: {
    name: "Default",
    description: "Default dark theme",
    dark: true,
    colors: {
      background: "#1a1a1a",
      foreground: "#e0e0e0",
      cursor: "#00ff00",
      selection: "#404040",
      command: "#4caf50",
      string: "#ffeb3b",
      number: "#00bcd4",
      keyword: "#e91e63",
      operator: "#2196f3",
      flag: "#9e9e9e",
      variable: "#f44336",
      comment: "#757575",
      error: "#f44336",
      success: "#4caf50",
      warning: "#ff9800",
      info: "#2196f3",
      prompt: "#4caf50",
      gitClean: "#4caf50",
      gitDirty: "#ff9800",
      path: "#00bcd4",
    },
  },
  
  dark: {
    name: "Dark",
    description: "Pure dark theme",
    dark: true,
    colors: {
      background: "#000000",
      foreground: "#ffffff",
      cursor: "#ffffff",
      selection: "#333333",
      command: "#90ee90",
      string: "#ffff99",
      number: "#87ceeb",
      keyword: "#ff69b4",
      operator: "#87cefa",
      flag: "#a9a9a9",
      variable: "#ff6b6b",
      comment: "#808080",
      error: "#ff4444",
      success: "#44ff44",
      warning: "#ffaa44",
      info: "#44aaff",
      prompt: "#90ee90",
      gitClean: "#44ff44",
      gitDirty: "#ffaa44",
      path: "#87ceeb",
    },
  },
  
  light: {
    name: "Light",
    description: "Clean light theme",
    dark: false,
    colors: {
      background: "#ffffff",
      foreground: "#333333",
      cursor: "#000000",
      selection: "#b3d9ff",
      command: "#228b22",
      string: "#b8860b",
      number: "#008b8b",
      keyword: "#8b008b",
      operator: "#0000cd",
      flag: "#696969",
      variable: "#dc143c",
      comment: "#808080",
      error: "#dc143c",
      success: "#228b22",
      warning: "#ff8c00",
      info: "#1e90ff",
      prompt: "#228b22",
      gitClean: "#228b22",
      gitDirty: "#ff8c00",
      path: "#008b8b",
    },
  },
  
  ocean: {
    name: "Ocean",
    description: "Deep ocean blue theme",
    dark: true,
    colors: {
      background: "#0d1117",
      foreground: "#c9d1d9",
      cursor: "#58a6ff",
      selection: "#21262d",
      command: "#7ee787",
      string: "#a5d6ff",
      number: "#79c0ff",
      keyword: "#ff7b72",
      operator: "#58a6ff",
      flag: "#8b949e",
      variable: "#ffa657",
      comment: "#6e7681",
      error: "#f85149",
      success: "#3fb950",
      warning: "#d29922",
      info: "#58a6ff",
      prompt: "#7ee787",
      gitClean: "#3fb950",
      gitDirty: "#d29922",
      path: "#79c0ff",
    },
  },
  
  monokai: {
    name: "Monokai",
    description: "Classic Monokai colors",
    dark: true,
    colors: {
      background: "#272822",
      foreground: "#f8f8f2",
      cursor: "#f8f8f0",
      selection: "#49483e",
      command: "#a6e22e",
      string: "#e6db74",
      number: "#ae81ff",
      keyword: "#f92672",
      operator: "#66d9ef",
      flag: "#75715e",
      variable: "#fd971f",
      comment: "#75715e",
      error: "#f92672",
      success: "#a6e22e",
      warning: "#fd971f",
      info: "#66d9ef",
      prompt: "#a6e22e",
      gitClean: "#a6e22e",
      gitDirty: "#fd971f",
      path: "#66d9ef",
    },
  },
};

// Theme manager
export class ThemeManager {
  private currentTheme: Theme = themes.default;
  private customThemes: Map<string, Theme> = new Map();

  // Get current theme
  getCurrent(): Theme {
    return this.currentTheme;
  }

  // Set theme by name
  setTheme(name: string): boolean {
    const theme = themes[name] || this.customThemes.get(name);
    if (theme) {
      this.currentTheme = theme;
      return true;
    }
    return false;
  }

  // Register custom theme
  registerTheme(name: string, theme: Theme): void {
    this.customThemes.set(name, { ...theme, name });
  }

  // List available themes
  listThemes(): string[] {
    return [...Object.keys(themes), ...this.customThemes.keys()];
  }

  // Get theme info as ShellValue
  getThemeInfo(name: string): ShellValue | null {
    const theme = themes[name] || this.customThemes.get(name);
    if (!theme) return null;

    return record({
      name: str(theme.name),
      description: str(theme.description),
      dark: { _tag: "Bool", value: theme.dark } as const,
      colors: record({
        background: str(theme.colors.background),
        foreground: str(theme.colors.foreground),
        command: str(theme.colors.command),
        string: str(theme.colors.string),
        number: str(theme.colors.number),
      }),
    });
  }

  // Export all themes
  exportThemes(): ShellValue {
    const allThemes: Record<string, ShellValue> = {};
    
    for (const [name, theme] of Object.entries(themes)) {
      allThemes[name] = record({
        name: str(theme.name),
        description: str(theme.description),
        dark: { _tag: "Bool", value: theme.dark } as const,
      });
    }
    
    for (const [name, theme] of this.customThemes) {
      allThemes[name] = record({
        name: str(theme.name),
        description: str(theme.description),
        dark: { _tag: "Bool", value: theme.dark } as const,
      });
    }
    
    return record(allThemes);
  }

  // Apply ANSI colors from theme
  applyAnsi(text: string, colorType: keyof ColorScheme): string {
    const color = this.currentTheme.colors[colorType];
    // Convert hex to ANSI (simplified)
    return `\x1b[38;5;${this.hexToAnsi(color)}m${text}\x1b[0m`;
  }

  private hexToAnsi(hex: string): number {
    // Simplified conversion - return a standard color
    const colorMap: Record<string, number> = {
      "#4caf50": 82,   // Green
      "#ffeb3b": 227,  // Yellow
      "#00bcd4": 51,   // Cyan
      "#e91e63": 198,  // Pink
      "#2196f3": 33,   // Blue
      "#9e9e9e": 245,  // Gray
      "#f44336": 196,  // Red
      "#757575": 243,  // Dark gray
    };
    return colorMap[hex.toLowerCase()] || 255;
  }
}

// Global theme manager
let globalThemeManager: ThemeManager | null = null;

export function getThemeManager(): ThemeManager {
  if (!globalThemeManager) {
    globalThemeManager = new ThemeManager();
  }
  return globalThemeManager;
}
