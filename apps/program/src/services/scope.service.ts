/**
 * Scope - For managing resource lifecycles
 *
 * Inspired by Effect.Scope
 */

import { err, ok, type Result } from "functional";

export type Finalizer = (exit: Exit) => Promise<void>;
export type Exit = { _tag: "Success" } | { _tag: "Failure"; error: unknown };

/**
 * Represents the lifetime of a resource, providing a way to guarantee
 * that finalizers are run.
 */
export class Scope {
	private finalizers: Finalizer[] = [];
	private closed = false;

	/**
	 * Adds a finalizer to the scope.
	 * @returns A function to remove the finalizer, if it hasn't been run yet.
	 */
	addFinalizer(finalizer: Finalizer): () => void {
		if (this.closed) {
			// If the scope is already closed, run the finalizer immediately.
			finalizer({ _tag: "Success" }).catch(console.error);
			return () => {};
		}

		this.finalizers.push(finalizer);
		return () => {
			const index = this.finalizers.indexOf(finalizer);
			if (index >= 0) {
				this.finalizers.splice(index, 1);
			}
		};
	}

	/**
	 * Closes the scope, running all finalizers in reverse order.
	 */
	async close(exit: Exit): Promise<Result<void, unknown[]>> {
		if (this.closed) {
			return ok(undefined) as any;
		}
		this.closed = true;

		const errors: unknown[] = [];
		const finalizers = this.finalizers.reverse();
		this.finalizers = [];

		for (const finalizer of finalizers) {
			try {
				await finalizer(exit);
			} catch (e) {
				errors.push(e);
			}
		}

		if (errors.length > 0) {
			return err(errors) as any;
		}

		return ok(undefined) as any;
	}

	/**
	 * Creates a new child scope.
	 */
	fork(): Scope {
		const child = new Scope();
		this.addFinalizer((exit) => child.close(exit).then(() => undefined));
		return child;
	}

	/**
	 * Creates a new Scope.
	 */
	static make(): Scope {
		return new Scope();
	}
}
