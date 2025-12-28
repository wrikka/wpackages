import { Effect } from "effect";

// The Visitor Interface declares a set of visiting methods that correspond to
// component classes.
export interface Visitor {
	readonly visitConcreteComponentA: (element: ConcreteComponentA) => Effect.Effect<string>;
	readonly visitConcreteComponentB: (element: ConcreteComponentB) => Effect.Effect<string>;
}

// The Component interface declares an `accept` method that should take the base
// visitor interface as an argument.
export interface Component {
	readonly accept: (visitor: Visitor) => Effect.Effect<string>;
}

// Each Concrete Component must implement the `accept` method in such a way that
// it calls the visitor's method corresponding to the component's class.
export class ConcreteComponentA implements Component {
	accept = (visitor: Visitor) => visitor.visitConcreteComponentA(this);
	exclusiveMethodOfConcreteComponentA = () => "A";
}

export class ConcreteComponentB implements Component {
	accept = (visitor: Visitor) => visitor.visitConcreteComponentB(this);
	specialMethodOfConcreteComponentB = () => "B";
}

// Concrete Visitors implement several versions of the same algorithm, which can
// work with all concrete component classes.
export class ConcreteVisitor1 implements Visitor {
	visitConcreteComponentA = (element: ConcreteComponentA) =>
		Effect.succeed(`ConcreteVisitor1: ${element.exclusiveMethodOfConcreteComponentA()}`);

	visitConcreteComponentB = (element: ConcreteComponentB) =>
		Effect.succeed(`ConcreteVisitor1: ${element.specialMethodOfConcreteComponentB()}`);
}
