import { describe, expect, it, vi } from "vitest";
import { map } from "../src";

describe("map", () => {
	it("should set and get an object value", () => {
		const user = map({ name: "John", age: 30 });
		expect(user.get()).toEqual({ name: "John", age: 30 });
		user.set({ name: "Jane", age: 25 });
		expect(user.get()).toEqual({ name: "Jane", age: 25 });
	});

	it("should set a specific key", () => {
		const profile = map({ verified: false, theme: "dark" });
		profile.setKey("verified", true);
		expect(profile.get()).toEqual({ verified: true, theme: "dark" });
	});

	it("should notify listeners on setKey", () => {
		const settings = map({ notifications: true });
		const listener = vi.fn();
		settings.subscribe(listener);

		settings.setKey("notifications", false);
		expect(listener).toHaveBeenCalledTimes(2);
		expect(listener).toHaveBeenCalledWith(
			{ notifications: false },
			{ notifications: true },
			"notifications",
		);
	});

	it("should not notify listeners if value is the same", () => {
		const data = map({ value: 100 });
		const listener = vi.fn();
		const unsubscribe = data.subscribe(listener);

		data.setKey("value", 100);

		// The listener is called once on subscribe, but not again on setKey
		expect(listener).toHaveBeenCalledTimes(1);

		unsubscribe();
	});
});
