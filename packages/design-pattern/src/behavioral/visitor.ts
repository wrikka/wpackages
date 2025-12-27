/**
 * Visitor Pattern - Pure functional implementation
 */

import type { Visitor } from "../types";

export const createVisitor = <T, TResult>(
	visit: (element: T) => TResult,
): Visitor<T, TResult> => ({
	visit,
});

export const createMultiVisitor = <T extends { type: string }, TResult>(
	visitors: Record<string, (element: T) => TResult>,
	defaultVisitor: (element: T) => TResult,
) => ({
	visit: (element: T): TResult => {
		const visitor = visitors[element.type] ?? defaultVisitor;
		return visitor(element);
	},
});

export const visitAll = <T, TResult>(
	elements: readonly T[],
	visitor: Visitor<T, TResult>,
): readonly TResult[] => {
	return elements.map((element) => visitor.visit(element));
};
