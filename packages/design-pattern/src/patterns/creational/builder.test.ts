import { describe, expect, it } from "vitest";
import { ConcreteBuilder1 } from "./builder";

describe("Builder Pattern", () => {
	it("should build a product with all parts", () => {
		const builder = new ConcreteBuilder1();
		builder.producePartA();
		builder.producePartB();
		builder.producePartC();

		const product = builder.getProduct();
		expect(product.listParts()).toBe("Product parts: PartA1, PartB1, PartC1");
	});

	it("should return a fresh product after getting one", () => {
		const builder = new ConcreteBuilder1();
		builder.producePartA();
		const product1 = builder.getProduct();
		expect(product1.listParts()).toBe("Product parts: PartA1");

		const product2 = builder.getProduct();
		expect(product2.listParts()).toBe("Product parts: ");
	});
});
