import { PatternMetadata } from "../../core/metadata";

export const metadata: PatternMetadata = {
	name: "Inheritance",
	description: "A mechanism where a new class inherits properties and methods from an existing class.",
	tags: ["oop", "inheritance", "class"],
};

export abstract class Animal {
	protected constructor(public name: string) {}

	public move(distanceInMeters: number = 0): string {
		return `${this.name} moved ${distanceInMeters}m.`;
	}

	public abstract makeSound(): string;
}

export class Dog extends Animal {
	constructor(name: string) {
		super(name);
	}

	public makeSound(): string {
		return "Woof! Woof!";
	}

	public bark(): string {
		return this.makeSound();
	}
}

export class Cat extends Animal {
	constructor(name: string) {
		super(name);
	}

	public makeSound(): string {
		return "Meow";
	}
}
