/**
 * All lint rules
 */

import type { Rule } from "../types";
import { noClass } from "./no-class.rule";
import { noConsole } from "./no-console.rule";
import { noDebugger } from "./no-debugger.rule";
import { noExplicitAny } from "./no-explicit-any.rule";
import { noIfElse } from "./no-if-else.rule";
import { noMutation } from "./no-mutation.rule";
import { noNull } from "./no-null.rule";
import { noUnsafeEval } from "./no-unsafe-eval.rule";
import { noVar } from "./no-var.rule";
import { preferArrowFunction } from "./prefer-arrow-function.rule";
import { preferConst } from "./prefer-const.rule";
import { preferPipe } from "./prefer-pipe.rule";
import { preferReadonly } from "./prefer-readonly.rule";

export const ALL_RULES: readonly Rule[] = [
	noConsole,
	noDebugger,
	noExplicitAny,
	noMutation,
	noNull,
	noUnsafeEval,
	noVar,
	preferArrowFunction,
	preferConst,
	preferReadonly,
	// Functional programming rules
	noClass,
	preferPipe,
	noIfElse,
] as const;

export const RECOMMENDED_RULES: readonly Rule[] = ALL_RULES.filter(
	(rule) => rule.meta.recommended,
);

export {
	// Functional programming rules
	noClass,
	noConsole,
	noDebugger,
	noExplicitAny,
	noIfElse,
	noMutation,
	noNull,
	noUnsafeEval,
	noVar,
	preferArrowFunction,
	preferConst,
	preferPipe,
	preferReadonly,
};
