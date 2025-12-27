/**
 * Composite Pattern - Pure functional implementation
 */

export interface CompositeNode<T> {
	readonly value: T;
	readonly children: readonly CompositeNode<T>[];
}

export const createLeaf = <T>(value: T): CompositeNode<T> => ({
	value,
	children: [],
});

export const createComposite = <T>(
	value: T,
	children: readonly CompositeNode<T>[] = [],
): CompositeNode<T> => ({
	value,
	children,
});

export const mapComposite = <T, R>(
	node: CompositeNode<T>,
	fn: (value: T) => R,
): CompositeNode<R> => ({
	value: fn(node.value),
	children: node.children.map((child) => mapComposite(child, fn)),
});

export const flattenComposite = <T>(node: CompositeNode<T>): readonly T[] => {
	return [
		node.value,
		...node.children.flatMap((child) => flattenComposite(child)),
	];
};
