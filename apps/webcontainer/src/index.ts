/**
 * webcontainer - WebContainer management library
 * Functional architecture with pure functions and effect handlers
 */

// Application composition layer
export * from "./app";

// Functional layers (in order of dependency)
export * from "./types";      // Type definitions
export * from "./config";     // Configuration
export * from "./constant";   // Constants
export * from "./components"; // Pure functions (validators)
export * from "./utils";      // Pure utilities
export * from "./services";   // Effect handlers
