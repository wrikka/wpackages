/**
 * Injects test APIs into the global scope.
 */

import { after, before, describe, it, only, test } from "./services";
import { expect } from "./utils";

export function injectGlobals(): void {
	const globalContext = globalThis as any;

	globalContext.describe = describe;
	globalContext.it = it;
	globalContext.test = test;
	globalContext.only = only;
	globalContext.before = before;
	globalContext.after = after;
	globalContext.expect = expect;
}
