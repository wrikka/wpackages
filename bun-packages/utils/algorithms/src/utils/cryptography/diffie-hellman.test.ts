import { describe, expect, it } from "vitest";
import { diffieHellmanKeyExchange } from "./diffie-hellman";

describe("DiffieHellman", () => {
	it("should generate matching shared secrets", () => {
		const p = 23;
		const g = 5;

		const result = diffieHellmanKeyExchange(p, g);

		expect(result.sharedSecret).toBeGreaterThan(0);
		expect(result.sharedSecret).toBeLessThan(p);
	});

	it("should handle different parameters", () => {
		const p = 17;
		const g = 3;

		const result = diffieHellmanKeyExchange(p, g);

		expect(result.sharedSecret).toBeGreaterThan(0);
		expect(result.sharedSecret).toBeLessThan(p);
	});
});
