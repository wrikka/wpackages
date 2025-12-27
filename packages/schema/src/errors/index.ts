import type { ValidationContext, Issue } from '../types';

export const addIssue = (ctx: ValidationContext & { issues: Issue[] }, issue: Omit<Issue, 'path'>) => {
  ctx.issues.push({ ...issue, path: ctx.path });
};