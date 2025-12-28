import { describe, expect, it } from "vitest";
import { Cat, Dog } from "./inheritance";

describe("OOP - Inheritance", () => {
	it("should allow a dog to bark and move", () => {
		const dog = new Dog("Buddy");
		expect(dog.name).toBe("Buddy");
		expect(dog.bark()).toBe("Woof! Woof!");
		expect(dog.move(10)).toBe("Buddy moved 10m.");
	});

	it("should allow a cat to meow and move", () => {
		const cat = new Cat("Lucy");
		expect(cat.name).toBe("Lucy");
		expect(cat.makeSound()).toBe("Meow");
		expect(cat.move(5)).toBe("Lucy moved 5m.");
	});
});
