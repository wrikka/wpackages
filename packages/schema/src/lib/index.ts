import type { Result as ResultType, Issue } from '../types';

export const createError = (message: string, received?: unknown): Omit<Issue, 'path'> => ({
	message,
	received,
});

export const Result = {
	ok: <T,>(data: T): ResultType<T> => ({ success: true, data }),
	err: (issues: Issue[]): ResultType<never> => ({ success: false, issues }),
};