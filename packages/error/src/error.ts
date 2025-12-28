export type ErrorContext = Record<string, unknown>;

export interface CustomErrorOptions {
  message?: string;
  cause?: unknown;
  context?: ErrorContext;
}

/**
 * Base class for all custom errors.
 * It ensures that all errors have a consistent structure.
 */
export class CustomError extends Error {
  public override readonly cause?: unknown;
  public readonly context: ErrorContext;
  public override name: string;

  constructor(options: CustomErrorOptions = {}) {
    super(options.message);
    this.name = this.constructor.name;
    this.cause = options.cause;
    this.context = options.context ?? {};

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    // Capturing the stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Returns a string representation of the error, including the stack trace.
   */
  public override toString(): string {
    return this.stack ?? `${this.name}: ${this.message}`;
  }

  /**
   * Adds additional context to the error.
   * @param context - The context to add.
   * @returns A new error instance with the added context.
   */
  public withContext(context: ErrorContext): this {
    const newContext = { ...this.context, ...context };

    const extra: Record<string, unknown> = {};
    for (const key of Object.keys(this)) {
      if (key === 'name' || key === 'message' || key === 'cause' || key === 'context' || key === 'stack') continue;
      extra[key] = (this as Record<string, unknown>)[key];
    }

    const Ctor = this.constructor as unknown as new (options: Record<string, unknown>) => this;
    return new Ctor({
      ...extra,
      message: this.message,
      cause: this.cause,
      context: newContext,
    });
  }
}

// ==================================
// AppError
// ==================================
export class AppError extends CustomError {}

// ==================================
// ValidationError
// ==================================
export interface ValidationErrorOptions extends CustomErrorOptions {
  field?: string;
  value?: unknown;
}
export class ValidationError extends CustomError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(options: ValidationErrorOptions = {}) {
    super(options);
    if ('field' in options) this.field = options.field;
    if ('value' in options) this.value = options.value;
  }
}

// ==================================
// HttpError
// ==================================
export interface HttpErrorOptions extends CustomErrorOptions {
  status: number;
  statusText?: string;
}
export class HttpError extends CustomError {
  public readonly status: number;
  public readonly statusText?: string;

  constructor(options: HttpErrorOptions) {
    super(options);
    this.status = options.status;
    if ('statusText' in options) this.statusText = options.statusText;
  }
}

// ==================================
// NotFoundError
// ==================================
export interface NotFoundErrorOptions extends CustomErrorOptions {
  resource: string;
  id?: string | number;
}
export class NotFoundError extends CustomError {
  public readonly resource: string;
  public readonly id?: string | number;

  constructor(options: NotFoundErrorOptions) {
    super(options);
    this.resource = options.resource;
    if ('id' in options) this.id = options.id;
  }
}

// ==================================
// UnauthorizedError
// ==================================
export interface UnauthorizedErrorOptions extends CustomErrorOptions {
  realm?: string;
}
export class UnauthorizedError extends CustomError {
  public readonly realm?: string;

  constructor(options: UnauthorizedErrorOptions = {}) {
    super(options);
    if ('realm' in options) this.realm = options.realm;
  }
}

// ==================================
// ForbiddenError
// ==================================
export interface ForbiddenErrorOptions extends CustomErrorOptions {
  action?: string;
  resource?: string;
}
export class ForbiddenError extends CustomError {
  public readonly action?: string;
  public readonly resource?: string;

  constructor(options: ForbiddenErrorOptions = {}) {
    super(options);
    if ('action' in options) this.action = options.action;
    if ('resource' in options) this.resource = options.resource;
  }
}

// ==================================
// ConflictError
// ==================================
export interface ConflictErrorOptions extends CustomErrorOptions {
  conflictingResource?: string;
}
export class ConflictError extends CustomError {
  public readonly conflictingResource?: string;

  constructor(options: ConflictErrorOptions = {}) {
    super(options);
    if ('conflictingResource' in options) this.conflictingResource = options.conflictingResource;
  }
}

// ==================================
// TimeoutError
// ==================================
export interface TimeoutErrorOptions extends CustomErrorOptions {
  timeout: number;
}
export class TimeoutError extends CustomError {
  public readonly timeout: number;

  constructor(options: TimeoutErrorOptions) {
    super(options);
    this.timeout = options.timeout;
  }
}

// ==================================
// NetworkError
// ==================================
export interface NetworkErrorOptions extends CustomErrorOptions {
  url?: string;
}
export class NetworkError extends CustomError {
  public readonly url?: string;

  constructor(options: NetworkErrorOptions = {}) {
    super(options);
    if ('url' in options) this.url = options.url;
  }
}

// ==================================
// DatabaseError
// ==================================
export interface DatabaseErrorOptions extends CustomErrorOptions {
  query?: string;
  table?: string;
}
export class DatabaseError extends CustomError {
  public readonly query?: string;
  public readonly table?: string;

  constructor(options: DatabaseErrorOptions = {}) {
    super(options);
    if ('query' in options) this.query = options.query;
    if ('table' in options) this.table = options.table;
  }
}

// ==================================
// AggregateError
// ==================================
export interface AggregateErrorOptions extends CustomErrorOptions {
  errors: CustomError[];
}
export class AggregateError extends CustomError {
  public readonly errors: CustomError[];

  constructor(options: AggregateErrorOptions) {
    super(options);
    this.errors = options.errors;
  }
}

// ==================================
// Union Type
// ==================================
export type AnyError = 
  | AppError
  | ValidationError
  | HttpError
  | NotFoundError
  | UnauthorizedError
  | ForbiddenError
  | ConflictError
  | TimeoutError
  | NetworkError
  | DatabaseError
  | AggregateError;
