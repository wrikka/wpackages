import type { ZodSchema } from "zod";
import type { MatcherResult } from "../../types";

import type { AssertionOptions } from "../../types";

export function toMatchSchema(received: unknown, schema: ZodSchema<any>, options?: AssertionOptions): MatcherResult {
  const result = schema.safeParse(received);

  if (result.success) {
    return {
      pass: true,
      message: () => "Expected value not to match schema",
    };
  }

  const issues = result.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  return {
    pass: false,
    message: () => options?.message || `Expected value to match schema, but it had the following issues:\n${issues}`,
  };
}
