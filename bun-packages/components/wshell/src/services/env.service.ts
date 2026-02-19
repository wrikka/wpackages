/**
 * Environment Switching for wshell
 * Virtual environments support
 */
import { execSync } from "child_process";
import type { ShellValue } from "../types/value.types";
import { record, str, list, bool } from "../types/value.types";

// Virtual environment
export interface VirtualEnv {
  name: string;
  path: string;
  type: "node" | "python" | "rust" | "custom";
  active: boolean;
}

// Environment manager
export class EnvManager {
  private envs: Map<string, VirtualEnv> = new Map();
  private activeEnv: VirtualEnv | null = null;

  // Detect available environments
  async detectEnvs(cwd: string = process.cwd()): Promise<VirtualEnv[]> {
    const fs = await import("fs/promises");
    const path = await import("path");
    const detected: VirtualEnv[] = [];

    // Check for Node.js (package.json)
    try {
      await fs.access(path.join(cwd, "package.json"));
      detected.push({
        name: "node",
        path: cwd,
        type: "node",
        active: false,
      });
    } catch { /* not a node project */ }

    // Check for Python (requirements.txt, pyproject.toml, .venv)
    try {
      await Promise.any([
        fs.access(path.join(cwd, "requirements.txt")),
        fs.access(path.join(cwd, "pyproject.toml")),
        fs.access(path.join(cwd, ".venv")),
      ]);
      detected.push({
        name: "python",
        path: cwd,
        type: "python",
        active: false,
      });
    } catch { /* not a python project */ }

    // Check for Rust (Cargo.toml)
    try {
      await fs.access(path.join(cwd, "Cargo.toml"));
      detected.push({
        name: "rust",
        path: cwd,
        type: "rust",
        active: false,
      });
    } catch { /* not a rust project */ }

    return detected;
  }

  // Activate environment
  activate(name: string): boolean {
    const env = this.envs.get(name);
    if (!env) return false;

    this.activeEnv = env;
    env.active = true;

    // Set environment-specific variables
    switch (env.type) {
      case "node":
        process.env.NODE_ENV = "development";
        break;
      case "python":
        // Add .venv/bin to PATH
        const venvPath = `${env.path}/.venv/bin`;
        if (process.env.PATH && !process.env.PATH.includes(venvPath)) {
          process.env.PATH = `${venvPath}:${process.env.PATH}`;
        }
        break;
      case "rust":
        // Cargo is usually already in PATH
        break;
    }

    return true;
  }

  // Deactivate current environment
  deactivate(): void {
    if (this.activeEnv) {
      this.activeEnv.active = false;
      this.activeEnv = null;
    }
  }

  // Get active environment
  getActive(): VirtualEnv | null {
    return this.activeEnv;
  }

  // List all environments
  list(): VirtualEnv[] {
    return Array.from(this.envs.values());
  }

  // Register custom environment
  register(name: string, envPath: string, type: VirtualEnv["type"] = "custom"): void {
    this.envs.set(name, {
      name,
      path: envPath,
      type,
      active: false,
    });
  }

  // Export as ShellValue
  export(): ShellValue {
    const envs: Record<string, ShellValue> = {};
    
    for (const [name, env] of this.envs) {
      envs[name] = record({
        name: str(env.name),
        path: str(env.path),
        type: str(env.type),
        active: { _tag: "Bool", value: env.active } as const,
      });
    }
    
    return record(envs);
  }
}

// Global environment manager
let globalEnvManager: EnvManager | null = null;

export function getEnvManager(): EnvManager {
  if (!globalEnvManager) {
    globalEnvManager = new EnvManager();
  }
  return globalEnvManager;
}
