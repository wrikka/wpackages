import { describe, expect, it } from "vitest";
import { createObservable } from "../behavioral/observer";

describe("Observer Pattern", () => {
	it("should notify observers", () => {
		const observable = createObservable<number>();
		let received = 0;

		observable.subscribe((value: number) => {
			received = value;
		});

		observable.notify(42);
		expect(received).toBe(42);
	});

	it("should unsubscribe observer", () => {
		const observable = createObservable<number>();
		let count = 0;

		const unsubscribe = observable.subscribe(() => {
			count++;
		});

		observable.notify(1);
		unsubscribe();
		observable.notify(2);

		expect(count).toBe(1);
	});
});
