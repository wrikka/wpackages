import { describe, expect, it } from "vitest";
import { createSignal } from "../utils/signal.util";
import { createSelector } from "./selector.service";

describe("createSelector", () => {
	it("should return true for the selected item and false for others", () => {
		const [selected, setSelected] = createSignal(1);
		const isSelected = createSelector(selected);

		expect(isSelected(1)).toBe(true);
		expect(isSelected(2)).toBe(false);
		expect(isSelected(3)).toBe(false);

		setSelected(2);

		expect(isSelected(1)).toBe(false);
		expect(isSelected(2)).toBe(true);
		expect(isSelected(3)).toBe(false);
	});
});
