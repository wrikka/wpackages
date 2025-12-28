import { Effect } from "effect";

// The Abstract Class defines a template method that contains a skeleton of some
// algorithm, composed of calls to (usually) abstract primitive operations.
export abstract class AbstractClass {
	// The template method
	templateMethod = (): Effect.Effect<string[]> =>
		Effect.gen(function*(this: AbstractClass) {
			const step1 = yield* this.baseOperation1();
			const step2 = yield* this.requiredOperations1();
			const step3 = yield* this.baseOperation2();
			const step4 = yield* this.hook1();
			return [step1, step2, step3, step4].filter(Boolean);
		}.bind(this));

	// These operations already have implementations.
	protected baseOperation1 = () => Effect.succeed("AbstractClass says: I am doing the bulk of the work");
	protected baseOperation2 = () => Effect.succeed("AbstractClass says: But I let subclasses override some operations");

	// These operations have to be implemented in subclasses.
	protected abstract requiredOperations1(): Effect.Effect<string>;

	// These are "hooks." Subclasses may override them, but it's not mandatory.
	protected hook1 = () => Effect.succeed("");
}

// Concrete classes have to implement all abstract operations of the base class.
export class ConcreteClass1 extends AbstractClass {
	protected override requiredOperations1 = () => Effect.succeed("ConcreteClass1 says: Implemented Operation1");
}

export class ConcreteClass2 extends AbstractClass {
	protected override requiredOperations1 = () => Effect.succeed("ConcreteClass2 says: Implemented Operation1");
	protected override hook1 = () => Effect.succeed("ConcreteClass2 says: Overridden Hook1");
}
