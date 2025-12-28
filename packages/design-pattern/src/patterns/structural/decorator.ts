import { PatternMetadata } from "../../core/metadata";

export const metadata: PatternMetadata = {
	name: "Decorator Pattern",
	description:
		"Attaches additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality.",
	tags: ["structural", "wrapper", "dynamic behavior"],
};

export interface Component {
	operation(): string;
}

export class ConcreteComponent implements Component {
	public operation(): string {
		return "ConcreteComponent";
	}
}

export class Decorator implements Component {
	protected component: Component;

	constructor(component: Component) {
		this.component = component;
	}

	public operation(): string {
		return this.component.operation();
	}
}

export class ConcreteDecoratorA extends Decorator {
	public override operation(): string {
		return `ConcreteDecoratorA(${super.operation()})`;
	}
}

export class ConcreteDecoratorB extends Decorator {
	public override operation(): string {
		return `ConcreteDecoratorB(${super.operation()})`;
	}
}
