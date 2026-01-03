import type { Issue, Result as ResultType } from "../types";

export const ok = <T>(data: T): ResultType<T> => ({ success: true, data });

export const err = <T>(issues: Issue[]): ResultType<T> => ({
	success: false,
	issues,
});

export const Result = { ok, err };
