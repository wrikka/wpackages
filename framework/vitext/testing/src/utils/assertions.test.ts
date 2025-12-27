import { describe, it } from "vitest";
import { expect, AssertionError } from "./assertions";

describe("Assertions", () => {
	describe("toBe", () => {
		it("should pass for identical values", () => {
			expect(42).toBe(42);
			expect("hello").toBe("hello");
			expect(true).toBe(true);
		});

		it("should fail for different values", () => {
			try {
				expect(42).toBe(43);
				throw new Error("Should have thrown");
			} catch (error) {
				if (error instanceof AssertionError) {
					expect(error.message).toContainString("strictly equal");
				} else {
					throw error;
				}
			}
		});
	});

	describe("toEqual", () => {
		it("should pass for equal objects", () => {
			expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 });
			expect([1, 2, 3]).toEqual([1, 2, 3]);
		});

		it("should fail for different objects", () => {
			try {
				expect({ a: 1 }).toEqual({ a: 2 });
				throw new Error("Should have thrown");
			} catch (error) {
				if (error instanceof AssertionError) {
					expect(error.message).toContainString("equal");
				} else {
					throw error;
				}
			}
		});
	});

	describe("toBeTruthy", () => {
		it("should pass for truthy values", () => {
			expect(true).toBeTruthy();
			expect(1).toBeTruthy();
			expect("hello").toBeTruthy();
			expect({}).toBeTruthy();
		});

		it("should fail for falsy values", () => {
			try {
				expect(false).toBeTruthy();
				throw new Error("Should have thrown");
			} catch (error) {
				if (error instanceof AssertionError) {
					expect(error.message).toContainString("truthy");
				} else {
					throw error;
				}
			}
		});
	});

	describe("toBeFalsy", () => {
		it("should pass for falsy values", () => {
			expect(false).toBeFalsy();
			expect(0).toBeFalsy();
			expect("").toBeFalsy();
			expect(null).toBeFalsy();
			expect(undefined).toBeFalsy();
		});

		it("should fail for truthy values", () => {
			try {
				expect(true).toBeFalsy();
				throw new Error("Should have thrown");
			} catch (error) {
				if (error instanceof AssertionError) {
					expect(error.message).toContainString("falsy");
				} else {
					throw error;
				}
			}
		});
	});

	describe("toBeNull", () => {
		it("should pass for null", () => {
			expect(null).toBeNull();
		});

		it("should fail for non-null", () => {
			try {
				expect(undefined).toBeNull();
				throw new Error("Should have thrown");
			} catch (error) {
				if (error instanceof AssertionError) {
					expect(error.message).toContainString("null");
				} else {
					throw error;
				}
			}
		});
	});

	describe("toContain", () => {
		it("should pass when array contains item", () => {
			expect([1, 2, 3]).toContain(2);
			expect(["a", "b", "c"]).toContain("b");
		});

		it("should fail when array does not contain item", () => {
			try {
				expect([1, 2, 3]).toContain(4);
				throw new Error("Should have thrown");
			} catch (error) {
				if (error instanceof AssertionError) {
					expect(error.message).toContainString("contain");
				} else {
					throw error;
				}
			}
		});
	});

	describe("toContainString", () => {
		it("should pass when string contains substring", () => {
			expect("hello world").toContainString("world");
			expect("typescript").toContainString("script");
		});

		it("should fail when string does not contain substring", () => {
			try {
				expect("hello").toContainString("world");
				throw new Error("Should have thrown");
			} catch (error) {
				if (error instanceof AssertionError) {
					expect(error.message).toContainString("contain");
				} else {
					throw error;
				}
			}
		});
	});

	describe("not", () => {
		it("should negate toBe", () => {
			expect(42).not.toBe(43);
		});

		it("should negate toEqual", () => {
			expect({ a: 1 }).not.toEqual({ a: 2 });
		});

		it("should negate toBeTruthy", () => {
			expect(false).not.toBeTruthy();
		});

		it("should negate toContain", () => {
			expect([1, 2, 3]).not.toContain(4);
		});
	});

});
