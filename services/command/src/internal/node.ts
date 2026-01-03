import type { CommandResult } from "../types/Command";
import type { ExecOptions } from "./bun";

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFilePromise = promisify(execFile);

export const runWithNode = async (file: string, args: ReadonlyArray<string>, options: ExecOptions): Promise<CommandResult> => {
    try {
        const { stdout, stderr } = await execFilePromise(file, [...args], {
            cwd: options.cwd,
            env: options.env ? { ...process.env, ...options.env } : process.env,
            encoding: "utf8",
            maxBuffer: 1024 * 1024,
        });
        return { exitCode: 0, stdout, stderr };
    } catch (error: any) {
        const exitCode = typeof error.code === "number" ? error.code : 1;
        const stdout = String(error.stdout ?? "");
        const stderr = String(error.stderr ?? error.message ?? "");
        return { exitCode, stdout, stderr };
    }
};