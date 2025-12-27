import { Schema } from '@effect/schema';

// Base Error Schema
export const BaseError = Schema.Struct({
  name: Schema.String,
  message: Schema.String,
  code: Schema.optional(Schema.String),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  cause: Schema.optional(Schema.Any),
});

// Specific Error Schemas
export const AppError = Schema.Struct({
  ...BaseError.fields,
  name: Schema.Literal('AppError'),
});
export type AppError = Schema.Schema.Type<typeof AppError>;

export const ValidationError = Schema.Struct({
  ...BaseError.fields,
  name: Schema.Literal('ValidationError'),
  field: Schema.optional(Schema.String),
  value: Schema.optional(Schema.Unknown),
});
export type ValidationError = Schema.Schema.Type<typeof ValidationError>;

export const HttpError = Schema.Struct({
  ...BaseError.fields,
  name: Schema.Literal('HttpError'),
  status: Schema.Number,
  statusText: Schema.optional(Schema.String),
});
export type HttpError = Schema.Schema.Type<typeof HttpError>;

export const NotFoundError = Schema.Struct({
  ...BaseError.fields,
  name: Schema.Literal('NotFoundError'),
  resource: Schema.String,
  id: Schema.optional(Schema.Union(Schema.String, Schema.Number)),
});
export type NotFoundError = Schema.Schema.Type<typeof NotFoundError>;

export const UnauthorizedError = Schema.Struct({
  ...BaseError.fields,
  name: Schema.Literal('UnauthorizedError'),
  realm: Schema.optional(Schema.String),
});
export type UnauthorizedError = Schema.Schema.Type<typeof UnauthorizedError>;

export const ForbiddenError = Schema.Struct({
  ...BaseError.fields,
  name: Schema.Literal('ForbiddenError'),
  action: Schema.optional(Schema.String),
  resource: Schema.optional(Schema.String),
});
export type ForbiddenError = Schema.Schema.Type<typeof ForbiddenError>;

export const ConflictError = Schema.Struct({
  ...BaseError.fields,
  name: Schema.Literal('ConflictError'),
  conflictingResource: Schema.optional(Schema.String),
});
export type ConflictError = Schema.Schema.Type<typeof ConflictError>;

export const TimeoutError = Schema.Struct({
  ...BaseError.fields,
  name: Schema.Literal('TimeoutError'),
  timeout: Schema.Number,
});
export type TimeoutError = Schema.Schema.Type<typeof TimeoutError>;

export const NetworkError = Schema.Struct({
  ...BaseError.fields,
  name: Schema.Literal('NetworkError'),
  url: Schema.optional(Schema.String),
});
export type NetworkError = Schema.Schema.Type<typeof NetworkError>;

export const DatabaseError = Schema.Struct({
  ...BaseError.fields,
  name: Schema.Literal('DatabaseError'),
  query: Schema.optional(Schema.String),
  table: Schema.optional(Schema.String),
});
export type DatabaseError = Schema.Schema.Type<typeof DatabaseError>;

export const ErrorGroup = Schema.Struct({
  ...BaseError.fields,
  name: Schema.Literal('ErrorGroup'),
  errors: Schema.Array(Schema.Any),
});
export type ErrorGroup = Schema.Schema.Type<typeof ErrorGroup>;

// Union of all error types
export const WottvError = Schema.Union(AppError, ValidationError, HttpError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError, TimeoutError, NetworkError, DatabaseError, ErrorGroup);
export type WottvError = Schema.Schema.Type<typeof WottvError>;

export const AggregateError = Schema.Struct({
  ...BaseError.fields,
  name: Schema.Literal('AggregateError'),
  errors: Schema.Array(WottvError),
});
export type AggregateError = Schema.Schema.Type<typeof AggregateError>;

export const AnyError = Schema.Union(WottvError, AggregateError);
export type AnyError = Schema.Schema.Type<typeof AnyError>;
