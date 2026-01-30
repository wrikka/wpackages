import { describe, expect, it } from "vitest";
import { lazy } from "./lazy-evaluation";

describe("lazyEvaluation", () => {
	it("should delay evaluation", () => {
		let evaluated = false;
		const lazyValue = lazy(() => {
			evaluated = true;
			return 42;
		});

		expect(evaluated).toBe(false);
		expect(lazyValue.isEvaluated()).toBe(false);

		const value = lazyValue.get();

		expect(evaluated).toBe(true);
		expect(value).toBe(42);
		expect(lazyValue.isEvaluated()).toBe(true);
	});

	it("should cache the result", () => {
		let callCount = 0;
		const lazyValue = lazy(() => {
			callCount++;
			return 42;
		});

		lazyValue.get();
		lazyValue.get();
		lazyValue.get();

		expect(callCount).toBe(1);
	});
});
