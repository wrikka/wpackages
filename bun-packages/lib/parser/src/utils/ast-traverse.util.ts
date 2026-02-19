/**
 * AST Traversal utility - Walk through AST nodes
 */

type ASTNode = {
	type: string;
	[key: string]: unknown;
};

type Visitor = (node: ASTNode, parent?: ASTNode) => undefined | boolean;

/**
 * Traverse AST tree depth-first
 */
export const traverse = (
	node: unknown,
	visitor: Visitor,
	parent?: ASTNode,
): void => {
	if (!node || typeof node !== "object") {
		return;
	}

	const astNode = node as ASTNode;

	// Visit current node
	const shouldStop = visitor(astNode, parent);
	if (shouldStop === false) {
		return;
	}

	// Traverse children
	for (const [key, value] of Object.entries(astNode)) {
		if (key === "type" || key === "start" || key === "end") {
			continue;
		}

		if (Array.isArray(value)) {
			for (const item of value) {
				traverse(item, visitor, astNode);
			}
		} else if (value && typeof value === "object") {
			traverse(value, visitor, astNode);
		}
	}
};

/**
 * Find all nodes matching a predicate
 */
export const findNodes = (
	ast: unknown,
	predicate: (node: ASTNode) => boolean,
): ASTNode[] => {
	const results: ASTNode[] = [];

	traverse(ast, (node) => {
		if (predicate(node)) {
			results.push(node);
			return undefined; // Continue traversal
		}
		return undefined; // Continue traversal
	});

	return results;
};

/**
 * Find first node matching a predicate
 */
export const findNode = (
	ast: unknown,
	predicate: (node: ASTNode) => boolean,
): ASTNode | undefined => {
	let result: ASTNode | undefined;

	traverse(ast, (node) => {
		if (predicate(node)) {
			result = node;
			return false; // Stop traversal
		}
		return undefined; // Continue traversal
	});

	return result;
};

/**
 * Find nodes by type
 */
export const findNodesByType = (ast: unknown, type: string): ASTNode[] => {
	return findNodes(ast, (node) => node.type === type);
};
