import type { ChangelogRenderer } from "../types";

/**
 * An example of a custom changelog renderer that outputs JSON.
 */
export const jsonChangelogRenderer: ChangelogRenderer = (context) => {
  return JSON.stringify(context, null, 2);
};
