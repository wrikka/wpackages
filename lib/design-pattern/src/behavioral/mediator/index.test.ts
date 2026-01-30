import { describe, expect, it, spyOn } from "bun:test";
import { Component1, Component2, ConcreteMediator } from "./index";

describe("Mediator Pattern", () => {
	it("should coordinate actions between components", () => {
		const c1 = new Component1();
		const c2 = new Component2();
		new ConcreteMediator(c1, c2);

		const c1DoBSpy = spyOn(c1, "doB");
		const c2DoCSpy = spyOn(c2, "doC");

		console.log("Client triggers operation A.");
		c1.doA();

		expect(c2DoCSpy).toHaveBeenCalled();

		console.log("\nClient triggers operation D.");
		c2.doD();

		expect(c1DoBSpy).toHaveBeenCalled();
		expect(c2DoCSpy).toHaveBeenCalledTimes(2);
	});
});
