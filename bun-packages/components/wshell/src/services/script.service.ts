/**
 * Script File Support (.ws) for wshell
 * Run wshell scripts with shebang support
 */
import { Effect } from "effect";
import { parse } from "../lib/parser";
import { executePipeline } from "../adapter/executor";
import { Shell } from "./shell.service";
import { pipelineEmpty } from "../types/pipeline.types";
import { str } from "../types/value.types";
import type { PipelineData } from "../types/pipeline.types";

// Script execution options
export interface ScriptOptions {
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  stdin?: PipelineData;
}

// Script execution context
export interface ScriptContext {
  file: string;
  args: string[];
  shell: Shell;
}

// Execute a .ws script file
export async function runScriptFile(
  filePath: string,
  options: ScriptOptions = {}
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const fs = await import("fs/promises");
  const path = await import("path");
  
  try {
    // Resolve path
    const resolvedPath = path.resolve(options.cwd || process.cwd(), filePath);
    
    // Read script content
    const content = await fs.readFile(resolvedPath, "utf-8");
    
    // Execute the script
    return await runScript(content, {
      ...options,
      cwd: path.dirname(resolvedPath),
    });
  } catch (error) {
    return {
      exitCode: 1,
      stdout: "",
      stderr: `Error reading script: ${error}`,
    };
  }
}

// Execute script content
export async function runScript(
  content: string,
  options: ScriptOptions = {}
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const lines = content.split("\n");
  let startLine = 0;
  
  // Skip shebang if present
  if (lines[0]?.startsWith("#!")) {
    startLine = 1;
  }
  
  // Get script body (excluding shebang and comments at top)
  const scriptLines: string[] = [];
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;
    
    // Skip empty lines at the beginning
    if (scriptLines.length === 0 && line.trim() === "") {
      continue;
    }
    
    scriptLines.push(line);
  }
  
  const scriptBody = scriptLines.join("\n");
  
  // Create shell instance
  const shell = new Shell(options.cwd, { ...process.env, ...options.env });
  
  // Set script arguments as environment variables
  if (options.args) {
    shell.setEnv("0", "wshell");
    options.args.forEach((arg, i) => {
      shell.setEnv(String(i + 1), arg);
    });
    shell.setEnv("*", options.args.join(" "));
    shell.setEnv("#", String(options.args.length));
  }
  
  try {
    // Tokenize and parse
    const tokens = await Effect.runPromise(parse.tokenize(scriptBody));
    const parsed = await Effect.runPromise(parse.parse(tokens));
    
    // Execute
    const result = await Effect.runPromise(
      executePipeline(parsed.pipeline, shell.createContext(options.stdin || pipelineEmpty()))
    );
    
    // Collect output
    const { collectToValue } = await import("../types/pipeline.types");
    const stdoutValue = await collectToValue(result.stdout);
    const stderrValue = await collectToValue(result.stderr);
    
    return {
      exitCode: result.exitCode,
      stdout: stdoutValue._tag === "String" ? stdoutValue.value : String(stdoutValue),
      stderr: stderrValue._tag === "String" ? stderrValue.value : String(stderrValue),
    };
  } catch (error) {
    return {
      exitCode: 1,
      stdout: "",
      stderr: `Script execution error: ${error}`,
    };
  }
}

// Check if file is a wshell script
export function isWshellScript(filePath: string): boolean {
  return filePath.endsWith(".ws") || filePath.endsWith(".wshell");
}

// Validate script syntax
export async function validateScript(content: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Skip shebang
    const lines = content.split("\n");
    let startLine = 0;
    if (lines[0]?.startsWith("#!")) {
      startLine = 1;
    }
    
    const scriptBody = lines.slice(startLine).join("\n");
    
    // Try to parse
    const tokens = await Effect.runPromise(parse.tokenize(scriptBody));
    await Effect.runPromise(parse.parse(tokens));
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: String(error) };
  }
}

// Create a new script file with shebang
export async function createScriptFile(
  filePath: string,
  content: string = ""
): Promise<void> {
  const fs = await import("fs/promises");
  
  const shebang = "#!/usr/bin/env wshell\n\n";
  const fullContent = shebang + content;
  
  await fs.writeFile(filePath, fullContent, "utf-8");
  
  // Make executable on Unix
  if (process.platform !== "win32") {
    await fs.chmod(filePath, 0o755);
  }
}
