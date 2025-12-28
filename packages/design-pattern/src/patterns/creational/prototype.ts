import { PatternMetadata } from "../../core/metadata";

export const metadata: PatternMetadata = {
	name: "Prototype Pattern",
	description: "Creates new objects by copying an existing object, known as the prototype.",
	tags: ["creational", "clone", "copy"],
};

export interface Prototype {
	clone(): Prototype;
}

export class ConcretePrototype1 implements Prototype {
	constructor(public field: number) {}

	public clone(): Prototype {
		return new ConcretePrototype1(this.field);
	}
}

export class ConcretePrototype2 implements Prototype {
	constructor(public field: string) {}

	public clone(): Prototype {
		return new ConcretePrototype2(this.field);
	}
}
