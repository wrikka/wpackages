import { describe, expect, it, vi } from "vitest";
import { ConcreteObserverA, ConcreteObserverB, ConcreteSubject } from "./observer";

describe("Observer Pattern", () => {
	it("should notify observers when state changes", () => {
		const subject = new ConcreteSubject();
		const observerA = new ConcreteObserverA();
		const observerB = new ConcreteObserverB();

		const spyA = vi.spyOn(observerA, "update");
		const spyB = vi.spyOn(observerB, "update");

		subject.attach(observerA);
		subject.attach(observerB);

		subject.someBusinessLogic();

		expect(spyA).toHaveBeenCalledWith(subject);
		expect(spyB).toHaveBeenCalledWith(subject);
	});

	it("should not notify a detached observer", () => {
		const subject = new ConcreteSubject();
		const observerA = new ConcreteObserverA();
		const spyA = vi.spyOn(observerA, "update");

		subject.attach(observerA);
		subject.detach(observerA);

		subject.someBusinessLogic();

		expect(spyA).not.toHaveBeenCalled();
	});
});
