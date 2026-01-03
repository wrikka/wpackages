import { bench, describe } from "vitest";
import { createMock } from "../utils/mock";

describe("Features Performance", () => {
	describe("Mocking", () => {
		bench("@wpackages/test createMock", () => {
			const mockFn = createMock<() => number>(() => 42);
			mockFn.mockReturnValue(100);
		});
	});
});
