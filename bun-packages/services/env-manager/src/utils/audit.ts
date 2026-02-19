import { auditSecrets, listSecretKeys } from "./secret-manager";

export type AuditRule = {
	name: string;
	description: string;
	severity: "error" | "warning" | "info";
	check: (env: Record<string, string>) => boolean;
};

export type AuditResult = {
	rule: string;
	severity: "error" | "warning" | "info";
	passed: boolean;
	message: string;
};

export type ComplianceReport = {
	passed: number;
	failed: number;
	warnings: number;
	infos: number;
	results: AuditResult[];
};

const DEFAULT_RULES: AuditRule[] = [
	{
		name: "sensitive-keys-encrypted",
		description: "Sensitive keys should be encrypted",
		severity: "error",
		check: (env) => {
			const audit = auditSecrets(env);
			return audit.unencryptedSecrets.length === 0;
		},
	},
	{
		name: "no-hardcoded-secrets",
		description: "No hardcoded secrets in environment",
		severity: "warning",
		check: (env) => {
			const sensitiveKeys = listSecretKeys(env);
			const hardcodedSecrets = sensitiveKeys.filter((key) => {
				const value = env[key];
				return (
					value === "secret" ||
					value === "password" ||
					value === "changeme" ||
					value === "123456" ||
					value === "admin"
				);
			});
			return hardcodedSecrets.length === 0;
		},
	},
	{
		name: "node-env-defined",
		description: "NODE_ENV should be defined",
		severity: "error",
		check: (env) => "NODE_ENV" in env && !!env.NODE_ENV,
	},
	{
		name: "valid-node-env",
		description: "NODE_ENV should be valid",
		severity: "error",
		check: (env) => {
			const validEnvs = ["development", "production", "test", "staging"];
			return !("NODE_ENV" in env) || validEnvs.includes(env.NODE_ENV);
		},
	},
	{
		name: "port-defined",
		description: "PORT should be defined",
		severity: "warning",
		check: (env) => "PORT" in env && !!env.PORT,
	},
	{
		name: "port-is-number",
		description: "PORT should be a valid number",
		severity: "error",
		check: (env) => {
			if (!("PORT" in env)) return true;
			return !isNaN(Number(env.PORT));
		},
	},
	{
		name: "no-empty-values",
		description: "No empty environment variable values",
		severity: "warning",
		check: (env) => {
			return !Object.values(env).some((v) => v === "" || v === undefined || v === null);
		},
	},
	{
		name: "url-format-valid",
		description: "URL variables should have valid format",
		severity: "warning",
		check: (env) => {
			const urlKeys = Object.keys(env).filter((k) => k.toLowerCase().includes("url"));
			for (const key of urlKeys) {
				const value = env[key];
				if (!value.startsWith("http://") && !value.startsWith("https://")) {
					return false;
				}
			}
			return true;
		},
	},
];

export const runAudit = (
	env: Record<string, string>,
	rules: AuditRule[] = DEFAULT_RULES,
): ComplianceReport => {
	const results: AuditResult[] = [];

	for (const rule of rules) {
		const passed = rule.check(env);
		results.push({
			rule: rule.name,
			severity: rule.severity,
			passed,
			message: passed ? `✓ ${rule.description}` : `✗ ${rule.description}`,
		});
	}

	const passed = results.filter((r) => r.passed).length;
	const failed = results.filter((r) => !r.passed && r.severity === "error").length;
	const warnings = results.filter((r) => !r.passed && r.severity === "warning").length;
	const infos = results.filter((r) => !r.passed && r.severity === "info").length;

	return {
		passed,
		failed,
		warnings,
		infos,
		results,
	};
};

export const formatAuditReport = (report: ComplianceReport): string => {
	const lines: string[] = [];

	lines.push("=== Environment Audit Report ===");
	lines.push(`Passed: ${report.passed}`);
	lines.push(`Failed: ${report.failed}`);
	lines.push(`Warnings: ${report.warnings}`);
	lines.push(`Infos: ${report.infos}`);
	lines.push("");

	for (const result of report.results) {
		const icon = result.passed ? "✓" : "✗";
		const severity = result.severity.toUpperCase();
		lines.push(`[${severity}] ${icon} ${result.rule}: ${result.message}`);
	}

	return lines.join("\n");
};

export const checkCompliance = (
	env: Record<string, string>,
	requiredKeys: string[],
): { compliant: boolean; missing: string[] } => {
	const missing = requiredKeys.filter((key) => !(key in env) || !env[key]);

	return {
		compliant: missing.length === 0,
		missing,
	};
};
