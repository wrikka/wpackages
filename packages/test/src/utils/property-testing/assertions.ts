import * as fc from "fast-check";

import type { Assertion } from "../../utils/assertions";
import { getPropertyTesting } from "./global";
import type { PropertyOptions } from "./types";

declare module "../../utils/assertions" {
	interface Assertion {
		toSatisfyProperty<T>(
			arb: fc.Arbitrary<T>,
			prop: (value: T) => boolean | void,
			options?: PropertyOptions,
		): Assertion;
	}
}

export function extendAssertionsWithPropertyTesting(Assertion: any): void {
	Assertion.prototype.toSatisfyProperty = function<T>(
		arb: fc.Arbitrary<T>,
		prop: (value: T) => boolean | void,
		options?: PropertyOptions,
	): Assertion {
		const pbt = getPropertyTesting();
		pbt.assertProperty(this, arb, prop, options);
		return this;
	};
}
