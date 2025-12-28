// CLI parsing
export { parseCliArgs } from "./cli-parser";

// Core statistics
export * from "./stats-core";

// Comparison utilities (legacy exports from bench-lib for backward compatibility)
export { findFastest, findSlowest } from "./comparison.utils";
export * from "./statistics.utils";

// String utilities
export { camelCase } from "./string.utils";
export { padEnd } from "./string.utils";
export { findMostSimilar } from "./string-similarity";
