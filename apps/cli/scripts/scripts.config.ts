import { DEFAULT_EXCLUDE_PATTERNS, DEFAULT_INCLUDE_PATTERNS, DEFAULT_MAX_CONCURRENCY } from "../constant/index";
import type { CheckerOptions } from "../types/index";

export const defaultCheckerOptions: CheckerOptions = {
	exclude: [...DEFAULT_EXCLUDE_PATTERNS],
	fix: false,
	include: [...DEFAULT_INCLUDE_PATTERNS],
	maxConcurrency: DEFAULT_MAX_CONCURRENCY,
	output: "text",
	parallel: true,
	silent: false,
	types: ["type", "unused", "deps"],
	verbose: false,
};

export const createCheckerConfig = (
	options: Partial<CheckerOptions> = {},
): CheckerOptions => ({
	...defaultCheckerOptions,
	...options,
});
