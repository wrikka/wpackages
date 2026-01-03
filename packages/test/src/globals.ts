/**
 * Injects test APIs into the global scope.
 */

import { describe, it, test, beforeAll, afterAll } from "./core/globals";
import { w } from "./core/w";
import { expect } from "./utils";

export function injectGlobals(): void {
	const globalContext = globalThis as any;

	globalContext.describe = describe;
	globalContext.it = it;
	globalContext.test = test;
	globalContext.beforeAll = beforeAll;
	globalContext.afterAll = afterAll;
	globalContext.expect = expect;
	globalContext.w = w;
}
