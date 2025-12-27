/**
 * Fiber - Lightweight concurrency primitive
 *
 * A Fiber represents a concurrent computation that can be composed,
 * cancelled, and joined with other fibers.
 */

import { Scope } from "./scope.service";

/**
 * Fiber ID - Unique identifier for a fiber
 */
export type FiberId = {
	readonly id: number;
	readonly startTime: number;
}

/**
 * Fiber Status
 */
export type FiberStatus =
	| { readonly _tag: "Running" }
	| { readonly _tag: "Done"; readonly value: unknown }
	| { readonly _tag: "Failed"; readonly error: unknown }
	| { readonly _tag: "Interrupted" };

/**
 * Fiber - A lightweight concurrent computation
 */
export class Fiber<A, E = never> {
	private status: FiberStatus = { _tag: "Running" };
	private observers: Array<(result: FiberStatus) => void> = [];
	private interruptSignal = false;
	private readonly id: FiberId;

	constructor(
		private readonly computation: Promise<A>,
		private readonly scope: Scope,
	) {
		this.id = {
			id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
			startTime: Date.now(),
		};
	}

	/**
	 * Get the fiber ID
	 */
	getId(): FiberId {
		return this.id;
	}

	/**
	 * Get the current status of the fiber
	 */
	getStatus(): FiberStatus {
		return this.status;
	}

	/**
	 * Start the fiber execution
	 */
	async start(): Promise<void> {
		if (this.status._tag !== "Running") {
			throw new Error("Fiber already started");
		}

		// Add finalizer to scope for cleanup
		const removeFinalizer = this.scope.addFinalizer(async (exit) => {
			if (exit._tag === "Failure") {
				await this.interrupt();
			}
		});

		try {
			const result = await this.computation;

			if (this.interruptSignal) {
				this.status = { _tag: "Interrupted" };
			} else {
				this.status = { _tag: "Done", value: result };
			}
		} catch (_error) {
			this.status = { _tag: "Failed", error: _error };
		} finally {
			removeFinalizer();
			this.notifyObservers();
		}
	}

	/**
	 * Interrupt the fiber
	 */
	async interrupt(): Promise<void> {
		this.interruptSignal = true;
		this.status = { _tag: "Interrupted" };
		this.notifyObservers();
	}

	/**
	 * Wait for the fiber to complete
	 */
	async join(): Promise<A> {
		if (this.status._tag === "Done") {
			return this.status.value as A;
		}

		if (this.status._tag === "Failed") {
			throw this.status.error;
		}

		if (this.status._tag === "Interrupted") {
			throw new Error("Fiber was interrupted");
		}

		// Wait for completion
		return new Promise<A>((resolve, reject) => {
			const observer = (status: FiberStatus) => {
				if (status._tag === "Done") {
					resolve(status.value as A);
				} else if (status._tag === "Failed") {
					reject(status.error);
				} else if (status._tag === "Interrupted") {
					reject(new Error("Fiber was interrupted"));
				}
			};

			this.observers.push(observer);
		});
	}

	/**
	 * Race this fiber with another fiber
	 */
	race<B, E2>(that: Fiber<B, E2>): Fiber<A | B, E | E2> {
		const raceComputation = Promise.race([
			this.computation,
			that.computation,
		]) as Promise<A | B>;

		return new Fiber(raceComputation, this.scope);
	}

	/**
	 * Zip this fiber with another fiber
	 */
	zip<B, E2>(that: Fiber<B, E2>): Fiber<[A, B], E | E2> {
		const zipComputation = Promise.all([
			this.computation,
			that.computation,
		]) as Promise<[A, B]>;

		return new Fiber(zipComputation, this.scope);
	}

	/**
	 * Map over the successful result of the fiber
	 */
	map<B>(f: (a: A) => B): Fiber<B, E> {
		const mappedComputation = this.computation.then(f);
		return new Fiber(mappedComputation, this.scope);
	}

	/**
	 * FlatMap over the successful result of the fiber
	 */
	flatMap<B, E2>(f: (a: A) => Fiber<B, E2>): Fiber<B, E | E2> {
		const flatMappedComputation = this.computation.then((result) => {
			const nextFiber = f(result);
			return nextFiber.computation;
		});

		return new Fiber(flatMappedComputation, this.scope);
	}

	private notifyObservers(): void {
		for (const observer of this.observers) {
			observer(this.status);
		}
		this.observers = [];
	}
}

/**
 * Fiber Runtime - Manages fiber execution
 */
export class FiberRuntime {
	private fibers = new Map<number, Fiber<unknown, unknown>>();
	private readonly scope: Scope;

	constructor() {
		this.scope = new Scope();
	}

	/**
	 * Create a new fiber from a Promise computation
	 */
	make<A, E = never>(computation: () => Promise<A>): Fiber<A, E> {
		const fiber = new Fiber(computation(), this.scope);
		this.fibers.set(fiber.getId().id, fiber);
		return fiber;
	}

	/**
	 * Run a computation in a new fiber and start it
	 */
	async fork<A, E = never>(computation: () => Promise<A>): Promise<Fiber<A, E>> {
		const fiber = this.make(computation);
		await fiber.start();
		return fiber;
	}

	/**
	 * Run multiple fibers concurrently
	 */
	async forkAll<A, E = never>(computations: (() => Promise<A>)[]): Promise<Fiber<A[], E>> {
		const allComputation = () => Promise.all(computations.map(comp => comp()));
		return this.make(allComputation);
	}

	/**
	 * Race multiple fibers
	 */
	async raceAll<A, E = never>(computations: (() => Promise<A>)[]): Promise<Fiber<A, E>> {
		const raceComputation = () => Promise.race(computations.map(comp => comp()));

		return this.make(raceComputation);
	}

	/**
	 * Interrupt all fibers
	 */
	async interruptAll(): Promise<void> {
		const interruptPromises: Promise<void>[] = [];

		for (const fiber of this.fibers.values()) {
			interruptPromises.push(fiber.interrupt());
		}

		await Promise.all(interruptPromises);
		await this.scope.close({ _tag: "Success" });
	}

	/**
	 * Get the scope for this runtime
	 */
	getScope(): Scope {
		return this.scope;
	}
}

/**
 * Global fiber runtime
 */
export const fiberRuntime = new FiberRuntime();

/**
 * Create a fiber from a Promise computation
 */
export function fork<A, E = never>(computation: () => Promise<A>): Fiber<A, E> {
	return fiberRuntime.make(computation);
}

/**
 * Run a computation in a new fiber and start it
 */
export async function runFork<A, E = never>(computation: () => Promise<A>): Promise<Fiber<A, E>> {
	return fiberRuntime.fork(computation);
}

/**
 * Run multiple computations concurrently
 */
export async function runForkAll<A, E = never>(computations: (() => Promise<A>)[]): Promise<Fiber<A[], E>> {
	return fiberRuntime.forkAll(computations);
}

/**
 * Race multiple computations
 */
export async function runRaceAll<A, E = never>(computations: (() => Promise<A>)[]): Promise<Fiber<A, E>> {
	return fiberRuntime.raceAll(computations);
}
