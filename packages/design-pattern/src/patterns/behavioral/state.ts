import { Effect } from "effect";

// The State interface declares methods that all Concrete State should implement.
export interface State {
	readonly handle: (context: Context) => Effect.Effect<void>;
}

// Concrete States implement various behaviors, associated with a state of the Context.
export class ConcreteStateA implements State {
	handle = (context: Context): Effect.Effect<void> =>
		Effect.sync(() => {
			context.state = new ConcreteStateB();
		});
}

export class ConcreteStateB implements State {
	handle = (context: Context): Effect.Effect<void> =>
		Effect.sync(() => {
			context.state = new ConcreteStateA();
		});
}

// The Context defines the interface of interest to clients.
export class Context {
	constructor(public state: State) {}

	request = (): Effect.Effect<void> => this.state.handle(this);
}
