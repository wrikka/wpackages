import { Effect } from "effect";
import { sg } from "@ast-grep/napi";
import { FileSystemService } from "../services/file-system.service";
import type { LinterPlugin, LintIssue } from "../types/plugins";
import type { LinterConfig } from "../core/config-loader";

async function findIssuesForFile(filePath: string, config: LinterConfig): Promise<LintIssue[]> {
    if (!config.astGrep?.rules) {
        return [];
    }

    const source = await FileSystemService.readFile(filePath).pipe(Effect.runPromise);
    const ast = sg.parse(source).root();
    const issues: LintIssue[] = [];

    for (const ruleConfig of config.astGrep.rules) {
        const matches = ast.findAll(ruleConfig.rule);
        for (const match of matches) {
            const range = match.range();
            issues.push({
                filePath,
                message: ruleConfig.message,
                ruleName: `ast-grep/${ruleConfig.id}`,
                line: range.start.line + 1,
                column: range.start.column + 1,
                severity: ruleConfig.severity,
                fixable: false,
            });
        }
    }

    return issues;
}

export const astGrepPlugin: LinterPlugin = {
    name: "ast-grep",
    lint: (files, _options, config) => Effect.tryPromise({
        try: async () => {
            const allIssues = await Promise.all(
                files.map(file => findIssuesForFile(file, config))
            );
            return {
                linterName: "ast-grep",
                issues: allIssues.flat(),
            };
        },
        catch: (error) => new Error(`ast-grep execution failed: ${error}`),
    }),
};
