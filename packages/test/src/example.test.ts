import { describe, it, test, expect, beforeAll, afterAll } from './index';

describe("Example Suite", () => {
	beforeAll(() => {
		console.log("-> beforeAll: Example Suite");
	});

	afterAll(() => {
		console.log("<- afterAll: Example Suite");
	});

	it("should pass this test", () => {
		console.log("  - Test 1 executed");
		const sum = 1 + 1;
		expect(sum).toBe(2);
	});

	test("should also pass this test", () => {
		console.log("  - Test 2 executed");
		expect(true).toBe(true);
	});

	describe("Nested Suite", () => {
		beforeAll(() => {
			console.log("  -> beforeAll: Nested Suite");
		});

		afterAll(() => {
			console.log("  <- afterAll: Nested Suite");
		});

		it("should handle nested tests", () => {
			console.log("    - Nested Test executed");
			expect("hello").toBe("hello");
		});
	});
});
