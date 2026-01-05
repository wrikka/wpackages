import { Effect } from "effect";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { LinterPlugin, LintIssue } from "../types/plugins";

const execPromise = promisify(exec);

// A very basic parser for oxlint's JSON output
function parseOxlintOutput(stdout: string): readonly LintIssue[] {
    const issues: LintIssue[] = [];
    try {
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
            const diagnostic = JSON.parse(line);
            issues.push({
                filePath: diagnostic.path,
                message: diagnostic.message,
                ruleName: diagnostic.rule_id,
                line: diagnostic.start,
                column: diagnostic.start_column,
                severity: diagnostic.severity.toLowerCase(),
                fixable: false, // Oxlint JSON output doesn't specify this
            });
        }
    } catch { // eslint-disable-line no-empty
        // Ignore parsing errors for now
    }
    return issues;
}

export const oxlintPlugin: LinterPlugin = {
    name: "Oxlint",
    lint: (files, _options, _config) => Effect.tryPromise({
        try: async () => {
            const command = `bunx oxlint --format=json ${files.join(" ")}`;
            try {
                const { stdout } = await execPromise(command);
                const issues = parseOxlintOutput(stdout);
                return { linterName: "Oxlint", issues };
            } catch (error: any) {
                // Oxlint exits with a non-zero code when issues are found.
                // We need to parse the stdout from the error object.
                if (error.stdout) {
                    const issues = parseOxlintOutput(error.stdout);
                    return { linterName: "Oxlint", issues };
                }
                // If there's no stdout, it's a real error
                throw error;
            }
        },
        catch: (error) => new Error(`Oxlint execution failed: ${error}`),
    }),
};
