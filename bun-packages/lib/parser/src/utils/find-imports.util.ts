import { findNodesByType } from "./ast-traverse.util";

/**
 * Import information
 */
export interface ImportInfo {
	source: string;
	specifiers: string[];
	isDefault: boolean;
	isNamespace: boolean;
}

/**
 * AST Node type for imports
 */
type ASTNodeWithProps = {
	source?: { value?: string };
	specifiers?: Array<{
		type: string;
		local?: { name?: string };
		imported?: { name?: string };
	}>;
};

/**
 * Extract import information from AST
 */
export const findImports = (ast: unknown): ImportInfo[] => {
	const importDeclarations = findNodesByType(ast, "ImportDeclaration");
	const imports: ImportInfo[] = [];

	for (const node of importDeclarations) {
		const nodeWithProps = node as ASTNodeWithProps;
		const source = nodeWithProps.source?.value;
		if (!source) continue;

		const specifiers: string[] = [];
		let isDefault = false;
		let isNamespace = false;

		const specs = nodeWithProps.specifiers;
		if (Array.isArray(specs)) {
			for (const spec of specs) {
				if (spec.type === "ImportDefaultSpecifier") {
					isDefault = true;
					specifiers.push(spec.local?.name || "default");
				} else if (spec.type === "ImportNamespaceSpecifier") {
					isNamespace = true;
					specifiers.push(spec.local?.name || "*");
				} else if (spec.type === "ImportSpecifier") {
					specifiers.push(spec.imported?.name || spec.local?.name || "unknown");
				}
			}
		}

		imports.push({
			source,
			specifiers,
			isDefault,
			isNamespace,
		});
	}

	return imports;
};

/**
 * Find all import sources
 */
export const findImportSources = (ast: unknown): string[] => {
	return findImports(ast).map((imp) => imp.source);
};

/**
 * Find imports from specific package
 */
export const findImportsFrom = (
	ast: unknown,
	packageName: string,
): ImportInfo[] => {
	return findImports(ast).filter((imp) => imp.source === packageName);
};
