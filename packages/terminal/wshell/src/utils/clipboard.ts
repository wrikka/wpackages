/**
 * Clipboard Integration for wshell
 * Copy/paste with system clipboard
 */
import type { ShellValue } from "../types/value.types";
import { str, bool } from "../types/value.types";

// Clipboard operations
export interface ClipboardOperations {
  copy(text: string): Promise<boolean>;
  paste(): Promise<string>;
  clear(): Promise<boolean>;
}

// Cross-platform clipboard implementation
class ClipboardManager implements ClipboardOperations {
  async copy(text: string): Promise<boolean> {
    try {
      if (process.platform === "darwin") {
        // macOS - use pbcopy
        const { execSync } = await import("child_process");
        execSync("pbcopy", { input: text });
        return true;
      } else if (process.platform === "linux") {
        // Linux - try xclip or wl-copy
        const { execSync } = await import("child_process");
        try {
          execSync("xclip -selection clipboard", { input: text });
        } catch {
          execSync("wl-copy", { input: text });
        }
        return true;
      } else if (process.platform === "win32") {
        // Windows - use clip
        const { execSync } = await import("child_process");
        execSync("clip", { input: text });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async paste(): Promise<string> {
    try {
      if (process.platform === "darwin") {
        // macOS - use pbpaste
        const { execSync } = await import("child_process");
        return execSync("pbpaste", { encoding: "utf-8" });
      } else if (process.platform === "linux") {
        // Linux - try xclip or wl-paste
        const { execSync } = await import("child_process");
        try {
          return execSync("xclip -selection clipboard -o", { encoding: "utf-8" });
        } catch {
          return execSync("wl-paste", { encoding: "utf-8" });
        }
      } else if (process.platform === "win32") {
        // Windows - no built-in paste command, return empty
        return "";
      }
      return "";
    } catch {
      return "";
    }
  }

  async clear(): Promise<boolean> {
    return this.copy("");
  }
}

// Global clipboard manager
const clipboardManager = new ClipboardManager();

// Copy to clipboard
export async function clipboardCopy(text: string): Promise<ShellValue> {
  const success = await clipboardManager.copy(text);
  return { _tag: "Bool", value: success } as const;
}

// Paste from clipboard
export async function clipboardPaste(): Promise<ShellValue> {
  const text = await clipboardManager.paste();
  return str(text);
}

// Clear clipboard
export async function clipboardClear(): Promise<ShellValue> {
  const success = await clipboardManager.clear();
  return { _tag: "Bool", value: success } as const;
}
