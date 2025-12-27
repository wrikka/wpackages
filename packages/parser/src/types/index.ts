/**
 * Types barrel export
 */

// Legacy types (backward compatibility)
export type { ParseError } from "./parse-error.type";
export type { ParseOptions } from "./parse-options.type";
export type { ParseResult } from "./parse-result.type";

// New universal types
export type { Language, LanguageCategory, LanguageInfo } from "./language.type";
export type { GenericParseResult, ParseOptionsBase, Parser } from "./parser-base.type";
