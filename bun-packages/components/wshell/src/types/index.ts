/**
 * types/ barrel exports
 * Shape layer - type definitions only
 */

// Value types
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
} from "./value.types";

// Pipeline types
export type {
  PipelineData,
} from "./pipeline.types";

// Command types
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
} from "./command.types";

// Value constructors
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
} from "./value.types";

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
} from "./pipeline.types";
