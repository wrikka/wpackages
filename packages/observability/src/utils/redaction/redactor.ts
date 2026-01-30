export type RedactionRule = {
	type: "field" | "pattern" | "custom";
	match: string | RegExp;
	replaceWith?: string;
	apply?: (value: unknown) => string | null;
};

export interface RedactorConfig {
	rules?: RedactionRule[];
	redactFields?: string[];
	redactPatterns?: Array<{ pattern: RegExp; replaceWith?: string }>;
	maskChar?: string;
}

const DEFAULT_PATTERNS: Array<{ pattern: RegExp; replaceWith?: string }> = [
	{ pattern: /\b\d{16}\b/g, replaceWith: "[REDACTED_CREDIT_CARD]" },
	{ pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replaceWith: "[REDACTED_EMAIL]" },
	{ pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replaceWith: "[REDACTED_SSN]" },
	{ pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, replaceWith: "Bearer [REDACTED_TOKEN]" },
];

const DEFAULT_FIELDS = ["password", "token", "secret", "apiKey", "accessToken", "refreshToken", "creditCard", "ssn"];

export class Redactor {
	private config: Required<Pick<RedactorConfig, "maskChar">> & RedactorConfig;
	private rules: RedactionRule[];

	constructor(config: RedactorConfig = {}) {
		this.config = {
			maskChar: "*",
			...config,
		};
		this.rules = this.buildRules();
	}

	private buildRules(): RedactionRule[] {
		const rules: RedactionRule[] = [];

		const fields = this.config.redactFields || DEFAULT_FIELDS;
		for (const field of fields) {
			rules.push({
				type: "field",
				match: field,
				replaceWith: this.config.maskChar.repeat(8),
			});
		}

		const patterns = this.config.redactPatterns || DEFAULT_PATTERNS;
		for (const { pattern, replaceWith } of patterns) {
			rules.push({
				type: "pattern",
				match: pattern,
				replaceWith: replaceWith || this.config.maskChar.repeat(8),
			});
		}

		if (this.config.rules) {
			rules.push(...this.config.rules);
		}

		return rules;
	}

	redact(value: unknown): unknown {
		if (value === null || value === undefined) {
			return value;
		}

		if (typeof value === "string") {
			return this.redactString(value);
		}

		if (typeof value === "number" || typeof value === "boolean") {
			return value;
		}

		if (Array.isArray(value)) {
			return value.map((item) => this.redact(item));
		}

		if (typeof value === "object") {
			return this.redactObject(value as Record<string, unknown>);
		}

		return value;
	}

	private redactString(str: string): string {
		let result = str;

		for (const rule of this.rules) {
			if (rule.type === "pattern" && rule.match instanceof RegExp) {
				result = result.replace(rule.match, rule.replaceWith || this.config.maskChar.repeat(8));
			}
		}

		return result;
	}

	private redactObject(obj: Record<string, unknown>): Record<string, unknown> {
		const result: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(obj)) {
			const redactedValue = this.redactValueByKey(key, value);
			result[key] = redactedValue;
		}

		return result;
	}

	private redactValueByKey(key: string, value: unknown): unknown {
		const lowerKey = key.toLowerCase();

		for (const rule of this.rules) {
			if (rule.type === "field" && typeof rule.match === "string") {
				if (lowerKey.includes(rule.match.toLowerCase())) {
					return rule.replaceWith || this.config.maskChar.repeat(8);
				}
			}

			if (rule.type === "custom" && rule.apply) {
				const customResult = rule.apply(value);
				if (customResult !== null) {
					return customResult;
				}
			}
		}

		return this.redact(value);
	}

	addRule(rule: RedactionRule): void {
		this.rules.push(rule);
	}

	getRules(): Readonly<RedactionRule[]> {
		return this.rules;
	}
}

export function createRedactor(config?: RedactorConfig): Redactor {
	return new Redactor(config);
}

export function redactValue(value: unknown, config?: RedactorConfig): unknown {
	const redactor = new Redactor(config);
	return redactor.redact(value);
}
