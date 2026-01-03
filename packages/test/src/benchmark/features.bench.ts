import { bench, describe } from "vitest";
import { createMock } from "../utils/mock";

describe("Features Performance", () => {
	describe("Mocking", () => {
		bench("@wpackages/test createMock", () => {
			const mockFn = createMock<() => number>(() => 42);
			mockFn.mockReturnValue(100);
		});

		bench("baseline function creation", () => {
			const baselineFn = () => 42;
			// This doesn't have a direct equivalent to mockReturnValue,
			// so we're primarily measuring the creation overhead.
		});
	});
});
