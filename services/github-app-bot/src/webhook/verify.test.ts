import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { verifyGitHubSignature } from "./verify";

describe("verifyGitHubSignature", () => {
	it("returns true for valid sha256 signature", () => {
		const secret = "s3cr3t";
		const rawBody = Buffer.from("hello");
		const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
		const ok = verifyGitHubSignature({ secret, rawBody, signature256: `sha256=${expected}` });
		expect(ok).toBe(true);
	});

	it("returns false for invalid signature", () => {
		const secret = "s3cr3t";
		const rawBody = Buffer.from("hello");
		const ok = verifyGitHubSignature({ secret, rawBody, signature256: "sha256=deadbeef" });
		expect(ok).toBe(false);
	});
});
