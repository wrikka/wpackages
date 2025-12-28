import { Effect } from "effect";

// The Memento interface provides a way to retrieve the memento's metadata.
export interface Memento {
	readonly getState: () => Effect.Effect<string>;
	readonly getName: () => Effect.Effect<string>;
	readonly getDate: () => Effect.Effect<Date>;
}

// The Concrete Memento contains the infrastructure for storing the Originator's state.
class ConcreteMemento implements Memento {
	private readonly date: Date;
	constructor(private state: string) {
		this.date = new Date();
	}

	getState() {
		return Effect.succeed(this.state);
	}
	getName() {
		return Effect.succeed(`${this.date.toISOString().slice(0, 19)} / (${this.state.substring(0, 9)}...)`);
	}
	getDate() {
		return Effect.succeed(this.date);
	}
}

// The Originator holds some important state that may change over time.
export class Originator {
	constructor(private state: string) {}

	save = (): Effect.Effect<Memento> => Effect.succeed(new ConcreteMemento(this.state));

	restore = (memento: Memento): Effect.Effect<void> =>
		Effect.gen(function*(this: Originator) {
			this.state = yield* memento.getState();
		}.bind(this));

	doSomething = (): Effect.Effect<void> =>
		Effect.sync(() => {
			this.state = Math.random().toString(36).substring(2, 15);
		});

	getState() {
		return Effect.succeed(this.state);
	}
}
