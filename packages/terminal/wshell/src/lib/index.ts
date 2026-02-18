/**
 * lib/ barrel exports
 * Pure logic layer - no side effects, no I/O
 */

// Shell template literal API
export { $, createShell, configureShell, getShellOptions, type ShellOptions, type WShellPromise } from "./shell";

// Filter utilities
export {
  getValueAtPath,
  evaluateCondition,
  compareValues,
  extractCellValue,
} from "./filters.utils";

// Selection filters (where, select, get)
export {
  filterWhere,
  selectColumns,
  getValue,
} from "./filters.selection";

// Ordering filters (sort, reverse)
export {
  sortBy,
  reverseItems,
} from "./filters.ordering";

// Aggregation filters (group-by, length)
export {
  groupBy,
  getLength,
} from "./filters.aggregation";

// Slicing filters (first, last, flatten, unique)
export {
  getFirst,
  getLast,
  flattenList,
  uniqueItems,
} from "./filters.slicing";

// Transform filters (each, map)
export {
  eachItem,
  mapItems,
} from "./filters.transform";

// Legacy filters export (backward compatibility)
export * from "./filters";

// Parser (pure parsing logic)
export { tokenize, parse, ParseError } from "./parser";
