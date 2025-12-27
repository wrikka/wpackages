/**
 * Third-party Library Wrappers
 * Centralized wrappers for external dependencies
 *
 * Note: These are re-exported from services that use them
 * - YAML parsing: see services/yaml.service.ts
 * - TOML parsing: see services/toml.service.ts
 * - File watching: see services/watch.service.ts
 * - Environment loading: see services/env-manager.service.ts
 */

// Type re-exports for third-party libraries
export type { ParseOptions as YamlParseOptions } from "yaml";
export type { ToStringOptions as YamlStringifyOptions } from "yaml";
