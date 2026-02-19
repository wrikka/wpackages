/**
 * Command History with Fuzzy Search for wshell
 * Ctrl+R style fuzzy search
 */
import { record, str, int, list, type ShellValue } from "../types/value.types";

// History entry
export interface HistoryEntry {
  id: number;
  command: string;
  timestamp: Date;
  exitCode: number;
  cwd: string;
}

// Fuzzy search result
export interface FuzzyMatch {
  entry: HistoryEntry;
  score: number;
  matches: number[]; // indices of matched characters
}

// History manager
export class HistoryManager {
  private entries: HistoryEntry[] = [];
  private maxSize: number = 1000;
  private currentId: number = 0;
  private persistPath?: string;

  constructor(options?: { maxSize?: number; persistPath?: string }) {
    if (options?.maxSize) this.maxSize = options.maxSize;
    if (options?.persistPath) this.persistPath = options.persistPath;
  }

  // Add entry to history
  addEntry(command: string, exitCode: number = 0, cwd: string = process.cwd()): HistoryEntry {
    // Skip empty commands and duplicates of the last command
    if (!command.trim()) return null as unknown as HistoryEntry;
    const lastEntry = this.entries[this.entries.length - 1];
    if (lastEntry && lastEntry.command === command) {
      return lastEntry;
    }

    const entry: HistoryEntry = {
      id: ++this.currentId,
      command: command.trim(),
      timestamp: new Date(),
      exitCode,
      cwd,
    };

    this.entries.push(entry);

    // Trim if exceeds max size
    if (this.entries.length > this.maxSize) {
      this.entries.shift();
    }

    return entry;
  }

  // Get all entries
  getAll(): HistoryEntry[] {
    return [...this.entries];
  }

  // Get recent entries
  getRecent(count: number = 10): HistoryEntry[] {
    return this.entries.slice(-count);
  }

  // Get entry by id
  getById(id: number): HistoryEntry | undefined {
    return this.entries.find(e => e.id === id);
  }

  // Search history with exact match
  search(query: string): HistoryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.entries.filter(e => 
      e.command.toLowerCase().includes(lowerQuery)
    );
  }

  // Fuzzy search (Ctrl+R style)
  fuzzySearch(query: string): FuzzyMatch[] {
    if (!query.trim()) {
      return this.entries.slice(-20).map(e => ({
        entry: e,
        score: 0,
        matches: [],
      }));
    }

    const matches: FuzzyMatch[] = [];
    const lowerQuery = query.toLowerCase();

    for (const entry of this.entries) {
      const result = this.calculateFuzzyScore(entry.command, lowerQuery);
      if (result.score > 0) {
        matches.push({
          entry,
          score: result.score,
          matches: result.indices,
        });
      }
    }

    // Sort by score (higher is better)
    return matches.sort((a, b) => b.score - a.score);
  }

  // Calculate fuzzy match score
  private calculateFuzzyScore(command: string, query: string): { score: number; indices: number[] } {
    const lowerCommand = command.toLowerCase();
    const indices: number[] = [];
    let score = 0;
    let queryIndex = 0;
    let lastMatchIndex = -1;

    for (let i = 0; i < lowerCommand.length && queryIndex < query.length; i++) {
      if (lowerCommand[i] === query[queryIndex]) {
        indices.push(i);
        
        // Score bonuses
        if (i === 0) score += 10; // Match at start
        if (lastMatchIndex >= 0 && i === lastMatchIndex + 1) score += 5; // Consecutive match
        if (i > 0 && lowerCommand[i - 1] === ' ') score += 3; // Word boundary
        
        score += 1; // Base score
        lastMatchIndex = i;
        queryIndex++;
      }
    }

    // If didn't match all query characters, score is 0
    if (queryIndex < query.length) {
      return { score: 0, indices: [] };
    }

    // Penalty for length difference
    score -= (command.length - query.length) * 0.1;

    return { score: Math.max(0, score), indices };
  }

  // Clear history
  clear(): void {
    this.entries = [];
  }

  // Delete entry by id
  deleteEntry(id: number): boolean {
    const index = this.entries.findIndex(e => e.id === id);
    if (index >= 0) {
      this.entries.splice(index, 1);
      return true;
    }
    return false;
  }

  // Export as ShellValue
  export(): ShellValue {
    return list(
      this.entries.map(e => record({
        id: { _tag: "Int", value: BigInt(e.id) } as const,
        command: str(e.command),
        timestamp: { _tag: "Date", value: e.timestamp } as const,
        exitCode: { _tag: "Int", value: BigInt(e.exitCode) } as const,
        cwd: str(e.cwd),
      }))
    );
  }

  // Save to file
  async save(): Promise<void> {
    if (!this.persistPath) return;
    
    const fs = await import("fs/promises");
    const data = JSON.stringify({
      entries: this.entries,
      currentId: this.currentId,
    }, null, 2);
    
    await fs.writeFile(this.persistPath, data, "utf-8");
  }

  // Load from file
  async load(): Promise<void> {
    if (!this.persistPath) return;
    
    try {
      const fs = await import("fs/promises");
      const data = await fs.readFile(this.persistPath, "utf-8");
      const parsed = JSON.parse(data);
      
      if (parsed.entries) {
        this.entries = parsed.entries.map((e: HistoryEntry) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
      }
      if (parsed.currentId) {
        this.currentId = parsed.currentId;
      }
    } catch {
      // Ignore load errors
    }
  }
}

// Global history manager
let globalHistory: HistoryManager | null = null;

export function getHistoryManager(): HistoryManager {
  if (!globalHistory) {
    const home = process.env.HOME || process.env.USERPROFILE;
    const persistPath = home ? `${home}/.wshell/history.json` : undefined;
    globalHistory = new HistoryManager({ persistPath });
  }
  return globalHistory;
}

export function setHistoryManager(history: HistoryManager): void {
  globalHistory = history;
}
