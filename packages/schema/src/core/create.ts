import type { Schema, ValidationContext, Result, Issue } from '../types';

export const createSchema = <TInput, TOutput>(
  parser: (input: TInput, ctx: ValidationContext & { issues: Issue[], data?: TOutput }) => void,
  options?: { name?: string }
): Schema<TInput, TOutput> => {
  return {
    parse: (input: unknown, context?: Partial<ValidationContext>): Result<TOutput> => {
      const ctx: ValidationContext & { issues: Issue[], data?: TOutput } = { path: context?.path || [], issues: [] };
      parser(input as TInput, ctx);
      if (ctx.issues.length > 0) {
        return { success: false, issues: ctx.issues };
      }
      return { success: true, data: ctx.data as TOutput };
    },
    _metadata: options || {},
    _input: undefined as any,
    _output: undefined as any,
  };
};