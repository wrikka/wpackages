import { describe, expect, it } from "vitest";
import { Adaptee, Adapter, Target } from "./adapter";

describe("Adapter Pattern", () => {
	it("should allow client to use adaptee via adapter", () => {
		const adaptee = new Adaptee();
		const adapter: Target = new Adapter(adaptee);

		const clientCode = (target: Target) => {
			return target.request();
		};

		const result = clientCode(adapter);
		expect(result).toBe("Adapter: (TRANSLATED) Specific request.");
	});
});
