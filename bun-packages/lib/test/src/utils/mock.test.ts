import { describe, expect, it, w } from "../index";

describe("Mock utilities", () => {
	describe("w.fn", () => {
		it("should create a mock function", () => {
			const mock = w.fn<() => number>(() => 42);
			const result = mock();
			expect(result).toBe(42);
		});

		it("should track calls", () => {
			const mock = w.fn<(x: number) => number>((x) => x * 2);
			mock(5);
			mock(10);
			expect(mock.callCount).toBe(2);
			expect(mock.calls.length).toBe(2);
		});

		it("should track results", () => {
			const mock = w.fn<(x: number) => number>((x) => x * 2);
			mock(5);
			mock(10);
			expect(mock.results.length).toBe(2);
			expect((mock.results as any)[0]).toBe(10);
			expect((mock.results as any)[1]).toBe(20);
		});

		it("should support mockReturnValue", () => {
			const mock = w.fn<() => number>(() => 1);
			const mockWithReturn = mock.mockReturnValue(42);
			expect(mockWithReturn()).toBe(42);
		});

		it("should support mockReturnValueOnce", () => {
			const mock = w.fn<() => number>(() => 1);
			mock.mockReturnValueOnce(42);
			mock.mockReturnValueOnce(99);
			expect(mock()).toBe(42);
			expect(mock()).toBe(99);
			expect(mock()).toBe(1);
		});

		it("should support mockImplementation", () => {
			const mock = w.fn<(x: number) => number>(() => 1);
			mock.mockImplementation((x) => x * 3);
			expect(mock(5)).toBe(15);
		});

		it("should support reset", () => {
			const mock = w.fn<() => number>(() => 42);
			mock();
			mock();
			expect(mock.callCount).toBe(2);
			mock.reset();
			expect(mock.callCount).toBe(0);
		});

		it("should track lastCall and lastResult", () => {
			const mock = w.fn<(x: number) => number>((x) => x * 2);
			mock(5);
			mock(10);
			expect((mock.lastCall as any)[0]).toBe(10);
			expect(mock.lastResult).toBe(20);
		});
	});

	describe("w.spyOn", () => {
		it("should spy on object method", () => {
			const obj = {
				getValue: () => 42,
			};
			const spy = w.spyOn(obj, "getValue");
			obj.getValue();
			expect(spy.callCount).toBe(1);
		});

		it("should track spy calls", () => {
			const obj = {
				add: (a: number, b: number) => a + b,
			};
			const spy = w.spyOn(obj, "add");
			obj.add(2, 3);
			obj.add(5, 7);
			expect(spy.callCount).toBe(2);
		});
	});
});
