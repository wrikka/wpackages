import pc from "picocolors";
import type { Plugin, ReleaseContext, ReleaseHook } from "../types";

const log = (hook: ReleaseHook, ctx: ReleaseContext) => {
	if (ctx.options.silent || !ctx.options.verbose) return;
	console.log(pc.dim(`[LifecycleLoggerPlugin] Fired hook: ${hook}`));
};

/**
 * An example plugin that logs every lifecycle hook event to the console.
 * Useful for debugging and understanding the release flow.
 */
export const LifecycleLoggerPlugin: Plugin = {
	name: "lifecycle-logger-plugin",
	hooks: {
		start: (ctx) => log("start", ctx),
		"before:validate": (ctx) => log("before:validate", ctx),
		"after:validate": (ctx) => log("after:validate", ctx),
		"before:bumpVersion": (ctx) => log("before:bumpVersion", ctx),
		"after:bumpVersion": (ctx) => log("after:bumpVersion", ctx),
		"before:changelog": (ctx) => log("before:changelog", ctx),
		"after:changelog": (ctx) => log("after:changelog", ctx),
		"before:gitCommit": (ctx) => log("before:gitCommit", ctx),
		"after:gitCommit": (ctx) => log("after:gitCommit", ctx),
		"before:publish": (ctx) => log("before:publish", ctx),
		"after:publish": (ctx) => log("after:publish", ctx),
		end: (ctx) => log("end", ctx),
	},
};
