import { Effect, Option } from "effect";

// The handler interface declares a method for building the chain of handlers.
// It also declares a method for executing a request.
export interface Handler<In, Out> {
	readonly setNext: (handler: Handler<In, Out>) => Handler<In, Out>;
	readonly handle: (request: In) => Effect.Effect<Option.Option<Out>>;
}

// The abstract handler class is a helper for building a chain.
export const createAbstractHandler = <In, Out>(): Pick<Handler<In, Out>, "setNext" | "handle"> => {
	let nextHandler: Option.Option<Handler<In, Out>> = Option.none();

	return {
		setNext: (handler: Handler<In, Out>) => {
			nextHandler = Option.some(handler);
			return handler;
		},
		handle: (request: In) =>
			Option.match(nextHandler, {
				onNone: () => Effect.succeed(Option.none()),
				onSome: (handler) => handler.handle(request),
			}),
	};
};

// Concrete Handlers
export const createMonkeyHandler = (): Handler<string, string> => {
	const base = createAbstractHandler<string, string>();
	return {
		...base,
		handle: (request: string) => {
			if (request === "Banana") {
				return Effect.succeed(Option.some(`Monkey: I'll eat the ${request}.`));
			}
			return base.handle(request);
		},
	};
};

export const createSquirrelHandler = (): Handler<string, string> => {
	const base = createAbstractHandler<string, string>();
	return {
		...base,
		handle: (request: string) => {
			if (request === "Nut") {
				return Effect.succeed(Option.some(`Squirrel: I'll eat the ${request}.`));
			}
			return base.handle(request);
		},
	};
};
