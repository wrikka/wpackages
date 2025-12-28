import { PatternMetadata } from "../../core/metadata";

export const metadata: PatternMetadata = {
	name: "Builder Pattern",
	description:
		"Separates the construction of a complex object from its representation, allowing the same construction process to create different representations.",
	tags: ["creational", "complex object", "step-by-step"],
};

export class Product {
	public parts: string[] = [];

	public add(part: string): void {
		this.parts.push(part);
	}

	public listParts(): string {
		return `Product parts: ${this.parts.join(", ")}`;
	}
}

export interface Builder {
	producePartA(): void;
	producePartB(): void;
	producePartC(): void;
	getProduct(): Product;
}

export class ConcreteBuilder1 implements Builder {
	private product!: Product;

	constructor() {
		this.reset();
	}

	public reset(): void {
		this.product = new Product();
	}

	public producePartA(): void {
		this.product.add("PartA1");
	}

	public producePartB(): void {
		this.product.add("PartB1");
	}

	public producePartC(): void {
		this.product.add("PartC1");
	}

	public getProduct(): Product {
		const result = this.product;
		this.reset();
		return result;
	}
}
