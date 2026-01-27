import { describe, expect, it } from "vitest";
import { createRedactor, Redactor, redactValue } from "./redactor";

describe("Redactor", () => {
	it("should redact password field", () => {
		const redactor = new Redactor();
		const result = redactor.redact({ password: "secret123" });
		expect(result.password).toBe("********");
	});

	it("should redact token field", () => {
		const redactor = new Redactor();
		const result = redactor.redact({ token: "abc123" });
		expect(result.token).toBe("********");
	});

	it("should redact email pattern", () => {
		const redactor = new Redactor();
		const result = redactor.redact("user@example.com");
		expect(result).toBe("[REDACTED_EMAIL]");
	});

	it("should redact credit card pattern", () => {
		const redactor = new Redactor();
		const result = redactor.redact("4111111111111111");
		expect(result).toBe("[REDACTED_CREDIT_CARD]");
	});

	it("should redact SSN pattern", () => {
		const redactor = new Redactor();
		const result = redactor.redact("123-45-6789");
		expect(result).toBe("[REDACTED_SSN]");
	});

	it("should redact bearer token", () => {
		const redactor = new Redactor();
		const result = redactor.redact("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
		expect(result).toBe("Bearer [REDACTED_TOKEN]");
	});

	it("should handle nested objects", () => {
		const redactor = new Redactor();
		const result = redactor.redact({
			user: {
				email: "user@example.com",
				password: "secret",
			},
		});
		expect(result.user.email).toBe("[REDACTED_EMAIL]");
		expect(result.user.password).toBe("********");
	});

	it("should handle arrays", () => {
		const redactor = new Redactor();
		const result = redactor.redact([
			{ email: "user1@example.com" },
			{ email: "user2@example.com" },
		]);
		expect(result[0].email).toBe("[REDACTED_EMAIL]");
		expect(result[1].email).toBe("[REDACTED_EMAIL]");
	});

	it("should use custom mask char", () => {
		const redactor = new Redactor({ maskChar: "#" });
		const result = redactor.redact({ password: "secret" });
		expect(result.password).toBe("########");
	});

	it("should add custom rule", () => {
		const redactor = new Redactor();
		redactor.addRule({
			type: "pattern",
			match: /\d{3}-\d{3}-\d{4}/g,
			replaceWith: "[PHONE]",
		});
		const result = redactor.redact("Call 123-456-7890");
		expect(result).toBe("Call [PHONE]");
	});

	it("should use custom redact fields", () => {
		const redactor = new Redactor({ redactFields: ["customField"] });
		const result = redactor.redact({ customField: "value" });
		expect(result.customField).toBe("********");
	});

	it("should not redact numbers and booleans", () => {
		const redactor = new Redactor();
		const result = redactor.redact({ count: 42, active: true });
		expect(result.count).toBe(42);
		expect(result.active).toBe(true);
	});

	it("should create redactor with factory function", () => {
		const redactor = createRedactor();
		expect(redactor).toBeInstanceOf(Redactor);
	});

	it("should redact value with helper function", () => {
		const result = redactValue({ password: "secret" });
		expect(result.password).toBe("********");
	});
});
