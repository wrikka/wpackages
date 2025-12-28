import { Effect } from "effect";

// The Mediator interface declares a method used by components to notify the
// mediator about various events.
export interface Mediator {
	readonly notify: (sender: object, event: string) => Effect.Effect<void>;
}

// Concrete Components don't talk to each other. They go through the Mediator.
class Component {
	constructor(public mediator: Mediator) {}
}

export class Component1 extends Component {
	doA(): Effect.Effect<void> {
		return Effect.gen(function*(this: Component1) {
			yield* Effect.log("Component 1 does A.");
			yield* this.mediator.notify(this, "A");
		}.bind(this));
	}
}

export class Component2 extends Component {
	doB(): Effect.Effect<void> {
		return Effect.gen(function*(this: Component2) {
			yield* Effect.log("Component 2 does B.");
			yield* this.mediator.notify(this, "B");
		}.bind(this));
	}
}

// Concrete Mediator implements cooperative behavior by coordinating several
// components.
export class ConcreteMediator implements Mediator {
	constructor(
		private component2: Component2,
	) {}

	notify(_sender: object, event: string): Effect.Effect<void> {
		if (event === "A") {
			return Effect.gen(function*(this: ConcreteMediator) {
				yield* Effect.log("Mediator reacts on A and triggers B:");
				yield* this.component2.doB();
			}.bind(this));
		}
		return Effect.void;
	}
}
