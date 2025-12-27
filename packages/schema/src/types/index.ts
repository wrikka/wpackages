export type ValidationContext = { path: (string | number)[] };
export type Issue = { code?: string; message: string; path: (string | number)[]; expected?: string; received?: unknown; minimum?: number; maximum?: number; validation?: string; pattern?: RegExp };
export type Result<T> = { success: true; data: T } | { success: false; issues: Issue[] };
export type Schema<TInput, TOutput = TInput> = { parse: (input: unknown, context?: Partial<ValidationContext>) => Result<TOutput>; _metadata: { name?: string }; _input: TInput; _output: TOutput };
export type Infer<S extends Schema<any, any>> = S extends Schema<any, infer O> ? O : never;
export enum ErrorCode { InvalidType, InvalidLiteral, InvalidEnumValue, InvalidString, InvalidNumber, InvalidDate, InvalidObject, InvalidArray, CustomError };
export type StringOptions = { min?: number; max?: number; pattern?: RegExp; message?: string; name?: string };
export type SchemaOptions = { message?: string; name?: string; description?: string };