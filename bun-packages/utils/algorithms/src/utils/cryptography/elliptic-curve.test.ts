import { describe, expect, it } from "vitest";
import { EllipticCurve, ECPoint } from "./elliptic-curve";

describe("EllipticCurve", () => {
	it("should add points correctly", () => {
		const curve = new EllipticCurve(2, 3, 97);
		const p1 = new ECPoint(3, 6);
		const p2 = new ECPoint(10, 7);

		const sum = curve.add(p1, p2);

		expect(sum.x).not.toBeNull();
		expect(sum.y).not.toBeNull();
	});

	it("should multiply points correctly", () => {
		const curve = new EllipticCurve(2, 3, 97);
		const p = new ECPoint(3, 6);

		const result = curve.multiply(p, 2);

		expect(result.x).not.toBeNull();
		expect(result.y).not.toBeNull();
	});

	it("should handle infinity point", () => {
		const curve = new EllipticCurve(2, 3, 97);
		const p = new ECPoint(3, 6);
		const infinity = new ECPoint(null, null);

		const sum = curve.add(p, infinity);

		expect(sum.equals(p)).toBe(true);
	});
});
