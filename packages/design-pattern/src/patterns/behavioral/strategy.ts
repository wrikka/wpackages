import { PatternMetadata } from "../../core/metadata";

export const metadata: PatternMetadata = {
	name: "Strategy Pattern",
	description:
		"Defines a family of algorithms, encapsulates each one, and makes them interchangeable. Strategy lets the algorithm vary independently from clients that use it.",
	tags: ["behavioral", "algorithm", "interchangeable"],
};

export interface Strategy {
	doAlgorithm(data: string[]): string[];
}

export class Context {
	private strategy: Strategy;

	constructor(strategy: Strategy) {
		this.strategy = strategy;
	}

	public setStrategy(strategy: Strategy) {
		this.strategy = strategy;
	}

	public doSomeBusinessLogic(): string[] {
		const result = this.strategy.doAlgorithm(["a", "b", "c", "d", "e"]);
		return result;
	}
}

export class ConcreteStrategyA implements Strategy {
	public doAlgorithm(data: string[]): string[] {
		return data.sort();
	}
}

export class ConcreteStrategyB implements Strategy {
	public doAlgorithm(data: string[]): string[] {
		return data.reverse();
	}
}
