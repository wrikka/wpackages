import { describe, expect, it, vi } from "vitest";
import { atom } from "../src";
import { onMount } from "../src";

describe("onMount", () => {
	it("should call onMount when the first listener subscribes", () => {
		const store = atom(0);
		const mountCallback = vi.fn();
		onMount(store, mountCallback);

		expect(mountCallback).not.toHaveBeenCalled();

		const unsubscribe = store.subscribe(() => {});
		expect(mountCallback).toHaveBeenCalledTimes(1);

		unsubscribe();
	});

	it("should call the returned onUnmount function when the last listener unsubscribes", () => {
		const store = atom(0);
		const unmountCallback = vi.fn();
		const mountCallback = vi.fn(() => unmountCallback);
		onMount(store, mountCallback);

		const unsubscribe1 = store.subscribe(() => {});
		const unsubscribe2 = store.subscribe(() => {});

		expect(unmountCallback).not.toHaveBeenCalled();

		unsubscribe1();
		expect(unmountCallback).not.toHaveBeenCalled();

		unsubscribe2();
		expect(unmountCallback).toHaveBeenCalledTimes(1);
	});
});
