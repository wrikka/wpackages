import { Context, Effect, Layer } from "effect";
import { readFile } from "node:fs/promises";
import { collectFiles } from "../components/index";
import { CHECK_NAMES } from "../constant/index";
import type { CheckIssue, CheckResult } from "../types/index";

export class SecurityCheckerService extends Context.Tag(
	"SecurityCheckerService",
)<
	SecurityCheckerService,
	{
		check: (patterns: string[]) => Effect.Effect<CheckResult, Error>;
	}
>() {}

// Common security patterns to detect
const SECURITY_PATTERNS = [
	{
		message: "Potential hardcoded secret or API key detected",
		pattern: /(?:password|secret|api[_-]?key|private[_-]?key|token|auth)\s*[:=]\s*['"`][^'"` ]{8,}['"`]/gi,
		severity: "error" as const,
	},
	{
		message: "Usage of eval() detected - potential security risk",
		pattern: /eval\s*\(/gi,
		severity: "warning" as const,
	},
	{
		message: "Usage of dangerouslySetInnerHTML - potential XSS risk",
		pattern: /dangerouslySetInnerHTML/gi,
		severity: "warning" as const,
	},
	{
		message: "Direct innerHTML assignment - potential XSS risk",
		pattern: /innerHTML\s*=/gi,
		severity: "warning" as const,
	},
	{
		message: "Usage of document.write() - potential security risk",
		pattern: /document\.write\s*\(/gi,
		severity: "warning" as const,
	},
	{
		message: "Usage of exec() - potential command injection risk",
		pattern: /exec\s*\(/gi,
		severity: "warning" as const,
	},
	{
		message: "Non-secure HTTP protocol detected - consider using HTTPS",
		pattern: /(?:http):\/\/(?!localhost|127\.0\.0\.1)/gi,
		severity: "info" as const,
	},
	{
		message: "Console statement found - may expose sensitive information in production",
		pattern: /console\.(log|debug|info|warn|error)\(/gi,
		severity: "info" as const,
	},
];

export const makeSecurityCheckerService = () => {
	const check = (patterns: string[]): Effect.Effect<CheckResult, Error> =>
		Effect.gen(function*() {
			const startTime = Date.now();
			const issues: CheckIssue[] = [];

			try {
				// Collect all files matching patterns
				const files = yield* Effect.promise(() => collectFiles(patterns));

				// Check each file for security issues
				for (const file of files) {
					try {
						const content = yield* Effect.promise(() => readFile(file, "utf-8"));
						const lines = content.split("\n");

						// Check each security pattern
						for (const { pattern, message, severity } of SECURITY_PATTERNS) {
							let match: RegExpExecArray | null;
							const regex = new RegExp(pattern);

							for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
								const line = lines[lineIndex];
								if (!line) continue;

								// Reset regex lastIndex for each line
								regex.lastIndex = 0;

								while ((match = regex.exec(line)) !== null) {
									// Skip if in comments
									const beforeMatch = line.substring(0, match.index);
									if (
										beforeMatch.includes("//")
										|| beforeMatch.includes("/*")
									) {
										continue;
									}

									issues.push({
										column: match.index + 1,
										file,
										line: lineIndex + 1,
										message,
										severity,
										suggestion: severity === "error"
											? "Remove hardcoded secrets and use environment variables"
											: "Review and fix if this is a security concern",
									});
								}
							}
						}
						// eslint-disable-next-line no-unused-vars
					} catch (_) {}
				}

				const hasErrors = issues.some((i) => i.severity === "error");

				return {
					duration: Date.now() - startTime,
					issues,
					name: CHECK_NAMES.security,
					status: hasErrors
						? ("failed" as const)
						: issues.length > 0
						? ("failed" as const)
						: ("passed" as const),
					summary: `Checked ${files.length} files, found ${issues.length} security issues`,
				};
			} catch (error) {
				return yield* Effect.fail(
					error instanceof Error
						? error
						: new Error("Security checking failed"),
				);
			}
		});

	return { check };
};

export const SecurityCheckerLive = Layer.effect(
	SecurityCheckerService,
	Effect.sync(() => makeSecurityCheckerService()),
);
