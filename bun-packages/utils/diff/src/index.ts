export {
	builtInComparators,
	type Comparator,
	compareWithCustomStrategy,
	type CustomDiffOptions,
} from "./core/custom-comparator";
export { diff, type DiffOptions, type DiffResult } from "./core/diff";
export { clearCache, diffWithCache } from "./core/diff-cache";
export { compressDiff, type CompressedDiff, decompressDiff } from "./core/diff-compression";
export { type DiffFilter, filterDiff } from "./core/diff-filter";
export { type DiffFormatter, formatDiff, formatters, registerFormatter } from "./core/diff-formatters";
export { DiffHistory, type DiffHistoryEntry } from "./core/diff-history";
export { mergeDiffs } from "./core/diff-merge";
export { deserializeDiff, type SerializedDiff, serializeDiff, validateSerializedDiff } from "./core/diff-serialization";
export { type DiffStatistics, formatStatistics, getDiffStatistics } from "./core/diff-statistics";
export { type DiffValidationResult, validateDiff } from "./core/diff-validation";
export { lcs, type LcsChange } from "./core/lcs";
export { patch, unpatch } from "./core/patch";
export {
	getChangedPaths,
	getPaths,
	getValueByPath,
	type PathDiffOptions,
	type PathNode,
	setValueByPath,
} from "./core/path-diff";
export { reverseDiff } from "./core/reverse-diff";
export { formatTextDiff, textDiff, type TextDiffLine, type TextDiffOptions } from "./core/text-diff";
export { createDiff } from "./formatters/createDiff";
export { ChangeType } from "./types";
export { isEqual } from "./utils/isEqual";
