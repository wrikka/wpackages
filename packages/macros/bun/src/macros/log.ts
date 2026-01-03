import { macro } from "bun";

export const log = macro((...args: any[]) => {
	const { line, path } = import.meta;
	return `console.log("[${path}:${line}]", ...${JSON.stringify(args)})`;
});
