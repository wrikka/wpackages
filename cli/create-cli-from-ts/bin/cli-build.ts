#!/usr/bin/env bun

/**
 * CLI Build Tool
 * Centralized build system for all CLI packages
 *
 * Usage:
 *   bun cli-build.ts [package-name] [command]
 *
 * Examples:
 *   bun cli-build.ts                    # Build all packages
 *   bun cli-build.ts command            # Build command package
 *   bun cli-build.ts prompt build       # Build prompt package
 *   bun cli-build.ts all lint           # Lint all packages
 */

import { $ } from "bun";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "../..");

type PackageName = "command" | "prompt" | "components" | "build-cli" | "all";
type Command = "build" | "lint" | "format" | "test" | "clean" | "dev";

const PACKAGES: Record<PackageName, string> = {
  all: ROOT,
  "build-cli": join(ROOT, "build-cli"),
  command: join(ROOT, "command"),
  components: join(ROOT, "components"),
  prompt: join(ROOT, "prompt"),
};

const colors = {
  blue: "\x1b[34m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
  yellow: "\x1b[33m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(pkg: string, cmd: string) {
  log(`\n▶ ${pkg} → ${cmd}`, "cyan");
}

function logSuccess(message: string) {
  log(`✓ ${message}`, "green");
}

function logError(message: string) {
  log(`✗ ${message}`, "red");
}

async function runCommand(
  packagePath: string,
  command: Command,
): Promise<boolean> {
  const packageName = packagePath.split("/").pop() || "unknown";

  try {
    logStep(packageName, command);

    switch (command) {
      case "build":
        // Use shared tsdown config
        await $`cd ${packagePath} && bun tsdown --config ${
          join(ROOT, "build-cli/configs/tsdown.shared.ts")
        } --exports --dts --minify`;
        break;

      case "lint":
        // Use local biome config
        await $`cd ${packagePath} && bun tsc --noEmit`;
        await $`cd ${packagePath} && bunx biome lint --write ./src`;
        break;

      case "format":
        // Use local biome config
        await $`cd ${packagePath} && bunx biome format --write ./src`;
        break;

      case "test":
        // Use shared vitest config
        await $`cd ${packagePath} && bunx vitest run --config ${join(ROOT, "build-cli/configs/vitest.shared.ts")}`;
        break;

      case "clean":
        await $`cd ${packagePath} && rm -rf dist`;
        break;

      case "dev":
        await $`cd ${packagePath} && bun --watch src/index.ts`;
        break;

      default:
        logError(`Unknown command: ${command as string}`);
        return false;
    }

    logSuccess(`${packageName} ${command} completed`);
    return true;
  } catch (error) {
    logError(`${packageName} ${command} failed: ${error}`);
    return false;
  }
}

async function buildAll(command: Command = "build") {
  log("\n🚀 Building all packages...", "bold");

  const packages: PackageName[] = [
    "components",
    "command",
    "prompt",
    "build-cli",
  ];
  const results: boolean[] = [];

  for (const pkg of packages) {
    const packagePath = PACKAGES[pkg];
    if (existsSync(packagePath)) {
      const success = await runCommand(packagePath, command);
      results.push(success);
    }
  }

  const allSuccess = results.every((r) => r);

  if (allSuccess) {
    log("\n✓ All packages completed successfully!", "green");
  } else {
    log("\n✗ Some packages failed", "red");
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const packageName = (args[0] || "all") as PackageName;
  const command = (args[1] || "build") as Command;

  log(`\n📦 CLI Build Tool`, "bold");
  log(`Package: ${packageName}`, "blue");
  log(`Command: ${command}`, "blue");

  if (packageName === "all") {
    await buildAll(command);
  } else if (packageName in PACKAGES) {
    const packagePath = PACKAGES[packageName];
    if (existsSync(packagePath)) {
      const success = await runCommand(packagePath, command);
      if (!success) {
        process.exit(1);
      }
    } else {
      logError(`Package not found: ${packageName}`);
      process.exit(1);
    }
  } else {
    logError(`Invalid package: ${packageName}`);
    log(`Available packages: ${Object.keys(PACKAGES).join(", ")}`, "yellow");
    process.exit(1);
  }
}

main().catch((error) => {
  logError(`Fatal error: ${error}`);
  process.exit(1);
});
