/**
 * Git Integration for wshell
 * Git status in prompt and git shortcuts
 */
import type { ShellValue } from "../types/value.types";
import { record, str, list, int, bool } from "../types/value.types";

// Git status info
export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  modified: number;
  staged: number;
  untracked: number;
  conflicted: number;
  isDirty: boolean;
  isRepo: boolean;
}

// Git integration service
export class GitService {
  // Check if current directory is a git repo
  async isRepo(cwd: string = process.cwd()): Promise<boolean> {
    try {
      const { execSync } = await import("child_process");
      execSync("git rev-parse --git-dir", { cwd, stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  }

  // Get git status
  async getStatus(cwd: string = process.cwd()): Promise<GitStatus> {
    const defaultStatus: GitStatus = {
      branch: "",
      ahead: 0,
      behind: 0,
      modified: 0,
      staged: 0,
      untracked: 0,
      conflicted: 0,
      isDirty: false,
      isRepo: false,
    };

    if (!(await this.isRepo(cwd))) {
      return defaultStatus;
    }

    try {
      const { execSync } = await import("child_process");

      // Get branch name
      let branch = "";
      try {
        branch = execSync("git branch --show-current", { cwd, encoding: "utf-8" }).trim();
      } catch {
        // Try to get detached HEAD
        try {
          branch = execSync("git rev-parse --short HEAD", { cwd, encoding: "utf-8" }).trim();
          branch = `:${branch}`;
        } catch {
          branch = "unknown";
        }
      }

      // Get status counts
      const statusOutput = execSync("git status --porcelain", { cwd, encoding: "utf-8" });
      const statusLines = statusOutput.split("\n").filter(l => l.length > 0);

      let modified = 0;
      let staged = 0;
      let untracked = 0;
      let conflicted = 0;

      for (const line of statusLines) {
        const x = line[0];
        const y = line[1];

        if (x === "U" || y === "U" || x === "D" && y === "D" || x === "A" && y === "A") {
          conflicted++;
        } else if (x !== " " && x !== "?") {
          staged++;
        }

        if (y === "M" || y === "D") {
          modified++;
        } else if (x === "?" && y === "?") {
          untracked++;
        }
      }

      // Get ahead/behind counts
      let ahead = 0;
      let behind = 0;
      try {
        const upstreamOutput = execSync(
          "git rev-list --left-right --count HEAD...@{upstream}",
          { cwd, encoding: "utf-8", stdio: "pipe" }
        ).trim();
        const [b, a] = upstreamOutput.split("\t").map(n => parseInt(n, 10));
        if (!isNaN(b)) behind = b;
        if (!isNaN(a)) ahead = a;
      } catch {
        // No upstream
      }

      return {
        branch,
        ahead,
        behind,
        modified,
        staged,
        untracked,
        conflicted,
        isDirty: modified > 0 || staged > 0 || untracked > 0 || conflicted > 0,
        isRepo: true,
      };
    } catch {
      return defaultStatus;
    }
  }

  // Format git status for prompt
  async formatPrompt(cwd: string = process.cwd()): Promise<string> {
    const status = await this.getStatus(cwd);
    
    if (!status.isRepo) {
      return "";
    }

    const colors = {
      reset: "\x1b[0m",
      branch: "\x1b[36m",   // Cyan
      ahead: "\x1b[32m",   // Green
      behind: "\x1b[31m",   // Red
      dirty: "\x1b[33m",   // Yellow
      clean: "\x1b[32m",   // Green
    };

    let prompt = `${colors.branch}${status.branch}${colors.reset}`;

    // Add ahead/behind indicators
    if (status.ahead > 0) {
      prompt += `${colors.ahead}↑${status.ahead}${colors.reset}`;
    }
    if (status.behind > 0) {
      prompt += `${colors.behind}↓${status.behind}${colors.reset}`;
    }

    // Add dirty indicator
    if (status.isDirty) {
      prompt += `${colors.dirty}*${colors.reset}`;
    } else {
      prompt += `${colors.clean}✓${colors.reset}`;
    }

    return `(${prompt}) `;
  }

  // Export status as ShellValue
  async exportStatus(cwd: string = process.cwd()): Promise<ShellValue> {
    const status = await this.getStatus(cwd);

    return record({
      branch: str(status.branch),
      ahead: { _tag: "Int", value: BigInt(status.ahead) } as const,
      behind: { _tag: "Int", value: BigInt(status.behind) } as const,
      modified: { _tag: "Int", value: BigInt(status.modified) } as const,
      staged: { _tag: "Int", value: BigInt(status.staged) } as const,
      untracked: { _tag: "Int", value: BigInt(status.untracked) } as const,
      conflicted: { _tag: "Int", value: BigInt(status.conflicted) } as const,
      isDirty: { _tag: "Bool", value: status.isDirty } as const,
      isRepo: { _tag: "Bool", value: status.isRepo } as const,
    });
  }

  // Quick git commands
  async gitAdd(files: string[] = ["."], cwd: string = process.cwd()): Promise<string> {
    try {
      const { execSync } = await import("child_process");
      const result = execSync(`git add ${files.join(" ")}`, { cwd, encoding: "utf-8" });
      return result.trim();
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async gitCommit(message: string, cwd: string = process.cwd()): Promise<string> {
    try {
      const { execSync } = await import("child_process");
      const result = execSync(`git commit -m "${message}"`, { cwd, encoding: "utf-8" });
      return result.trim();
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async gitPush(cwd: string = process.cwd()): Promise<string> {
    try {
      const { execSync } = await import("child_process");
      const result = execSync("git push", { cwd, encoding: "utf-8" });
      return result.trim();
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async gitPull(cwd: string = process.cwd()): Promise<string> {
    try {
      const { execSync } = await import("child_process");
      const result = execSync("git pull", { cwd, encoding: "utf-8" });
      return result.trim();
    } catch (error) {
      return `Error: ${error}`;
    }
  }
}

// Global git service
let globalGitService: GitService | null = null;

export function getGitService(): GitService {
  if (!globalGitService) {
    globalGitService = new GitService();
  }
  return globalGitService;
}
