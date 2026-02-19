/**
 * Undo/Redo System for wshell
 * Command history undo
 */
import type { ShellValue } from "../types/value.types";
import { record, str, int, list, bool } from "../types/value.types";

// Command snapshot
export interface CommandSnapshot {
  id: number;
  command: string;
  cwd: string;
  env: Record<string, string>;
  timestamp: Date;
}

// Undo/Redo manager
export class UndoManager {
  private history: CommandSnapshot[] = [];
  private currentIndex: number = -1;
  private maxSize: number = 100;

  constructor(maxSize?: number) {
    if (maxSize) this.maxSize = maxSize;
  }

  // Add command to history
  add(command: string, cwd: string = process.cwd()): CommandSnapshot {
    // Remove any redo history if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    const snapshot: CommandSnapshot = {
      id: this.currentIndex + 1,
      command,
      cwd,
      env: { ...process.env },
      timestamp: new Date(),
    };

    this.history.push(snapshot);
    this.currentIndex++;

    // Trim history if exceeds max size
    if (this.history.length > this.maxSize) {
      this.history.shift();
      this.currentIndex--;
    }

    return snapshot;
  }

  // Undo - get previous command
  undo(): CommandSnapshot | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex] || null;
    }
    return null;
  }

  // Redo - get next command
  redo(): CommandSnapshot | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex] || null;
    }
    return null;
  }

  // Can undo?
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  // Can redo?
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  // Get current position
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  // Get total count
  getCount(): number {
    return this.history.length;
  }

  // Get all history
  getHistory(): CommandSnapshot[] {
    return [...this.history];
  }

  // Clear history
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  // Export as ShellValue
  export(): ShellValue {
    return list(
      this.history.map((s, i) => record({
        id: { _tag: "Int", value: BigInt(s.id) } as const,
        command: str(s.command),
        cwd: str(s.cwd),
        timestamp: { _tag: "Date", value: s.timestamp } as const,
        current: { _tag: "Bool", value: i === this.currentIndex } as const,
      }))
    );
  }
}

// Global undo manager
let globalUndoManager: UndoManager | null = null;

export function getUndoManager(): UndoManager {
  if (!globalUndoManager) {
    globalUndoManager = new UndoManager();
  }
  return globalUndoManager;
}

export function setUndoManager(manager: UndoManager): void {
  globalUndoManager = manager;
}
