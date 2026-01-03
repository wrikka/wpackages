import { describe, expect, it } from "vitest";
import { formatStatus } from "../../src/utils/format.utils";

describe("Format Utils - formatStatus", () => {
	it("should format disabled status", () => {
		expect(formatStatus("disabled")).toBe("🔴 Disabled");
	});

	it("should format enabled status", () => {
		expect(formatStatus("enabled")).toBe("🟢 Enabled");
	});

	it("should format error status", () => {
		expect(formatStatus("error")).toBe("❌ Error");
	});

	it("should format installed status", () => {
		expect(formatStatus("installed")).toBe("⚪ Installed");
	});
});
