/**
 * wshell - A modern shell with structured data pipelines
 * Main exports
 */

// Types
export type {
  ShellValue,
  IntValue,
  FloatValue,
  StringValue,
  BoolValue,
  DateValue,
  FilesizeValue,
  DurationValue,
  NullValue,
  ListValue,
  RecordValue,
  TableValue,
  RangeValue,
  CellPathValue,
  BinaryValue,
  ClosureValue,
  Type,
  FilesizeUnit,
  DurationUnit,
} from "./types/value.types";

export type {
  PipelineData,
} from "./types/pipeline.types";

export type {
  Token,
  TokenType,
  Command,
  CommandArg,
  Pipeline,
  ParsedCommand,
  CommandContext,
  CommandResult,
  CommandHandler,
  BuiltinCommand,
  CommandCategory,
  CommandSignature,
  PositionalParam,
  NamedParam,
  CommandExample,
  CommandRegistry,
  PluginCommand,
} from "./types/command.types";

// Value constructors and utilities
export {
  int,
  float,
  str,
  bool,
  date,
  filesize,
  duration,
  nil,
  list,
  record,
  table,
  binary,
  isInt,
  isFloat,
  isString,
  isBool,
  isDate,
  isList,
  isRecord,
  isTable,
  isBinary,
  isNull,
  getType,
  toString,
  toJSON,
} from "./types/value.types";

// Pipeline utilities
export {
  pipelineValue,
  pipelineEmpty,
  pipelineListStream,
  pipelineTableStream,
  pipelineByteStream,
  isValue,
  isListStream,
  isTableStream,
  isByteStream,
  isEmpty,
  collectToValue,
  toPipelineData,
} from "./types/pipeline.types";

// Shell template literal (main API)
export { $ } from "./lib/shell";

// Services
export { Shell } from "./services/shell.service";

// Version
export const VERSION = "0.0.1";
