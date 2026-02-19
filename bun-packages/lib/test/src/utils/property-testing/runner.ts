import * as fc from "fast-check";

import type { Assertion } from "../../utils/assertions";
import { arbitraries } from "./arbitraries";
import { templates } from "./templates";
import type { PropertyOptions, PropertyResult } from "./types";

export class PropertyBasedTesting {
	private defaultOptions: Required<PropertyOptions> = {
		numRuns: 100,
		timeout: 30000,
		seed: Date.now(),
		path: "shrink",
	};

	constructor(options: Partial<PropertyOptions> = {}) {
		this.defaultOptions = { ...this.defaultOptions, ...options };
	}

	public property<T>(
		name: string,
		arb: fc.Arbitrary<T>,
		prop: (value: T) => boolean | void,
		options: PropertyOptions = {},
	): PropertyResult {
		const opts = { ...this.defaultOptions, ...options };
		const startTime = Date.now();

		try {
			const result = fc.check(
				fc.property(arb, (value: T) => {
					try {
						const result = prop(value);
						return result !== false;
					} catch (error: any) {
						console.debug(`Property test '${name}' error:`, error.message);
						return false;
					}
				}),
				{
					numRuns: opts.numRuns,
					timeout: opts.timeout,
					seed: opts.seed,
					path: opts.path as fc.Path,
				},
			);

			const duration = Date.now() - startTime;

			if (result.failed) {
				return {
					passed: false,
					numRuns: result.numRuns,
					failed: {
						input: result.counterexample,
						error: new Error(result.error || "Property failed"),
						shrunk: result.counterexample,
					},
					duration,
				};
			}

			return {
				passed: true,
				numRuns: result.numRuns,
				duration,
			};
		} catch (error) {
			return {
				passed: false,
				numRuns: 0,
				failed: {
					input: undefined,
					error: error as Error,
				},
				duration: Date.now() - startTime,
			};
		}
	}

	public assertProperty<T>(
		assert: Assertion,
		arb: fc.Arbitrary<T>,
		prop: (value: T) => boolean | void,
		options: PropertyOptions = {},
	): void {
		const result = this.property("assertProperty", arb, prop, options);

		if (!result.passed) {
			const message = result.failed
				? `Property failed after ${result.numRuns} runs\n`
					+ `Failed input: ${JSON.stringify(result.failed.input)}\n`
					+ (result.failed.shrunk ? `Shrunk to: ${JSON.stringify(result.failed.shrunk)}\n` : "")
					+ `Error: ${result.failed.error.message}`
				: "Property test failed";

			assert.throws(() => {
				throw new Error(message);
			});
		}
	}

	public get arbitraries() {
		return arbitraries;
	}

	public get templates() {
		return templates;
	}

	public collectStats<T>(
		arb: fc.Arbitrary<T>,
		classifier: (value: T) => string,
		numRuns: number = 1000,
	): Record<string, number> {
		const stats: Record<string, number> = {};

		for (let i = 0; i < numRuns; i++) {
			const value = fc.sample(arb, 1)[0];
			if (value !== undefined) {
				const category = classifier(value);
				stats[category] = (stats[category] || 0) + 1;
			}
		}

		return stats;
	}
}
