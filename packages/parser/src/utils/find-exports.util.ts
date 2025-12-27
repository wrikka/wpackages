import { findNodesByType } from "./ast-traverse.util";

/**
 * Export information
 */
export interface ExportInfo {
	name: string;
	isDefault: boolean;
	isNamed: boolean;
	source?: string;
}

/**
 * AST Node types for exports
 */
type DeclarationNode = {
	type: string;
	id?: { name?: string };
	declarations?: Array<{ id?: { name?: string } }>;
};

type ExportNodeWithProps = {
	declaration?: DeclarationNode;
	source?: { value?: string };
	specifiers?: Array<{
		exported?: { name?: string };
		local?: { name?: string };
	}>;
};

/**
 * Extract export information from AST
 */
export const findExports = (ast: unknown): ExportInfo[] => {
	const exports: ExportInfo[] = [];

	// Find named exports
	const namedExports = findNodesByType(ast, "ExportNamedDeclaration");
	for (const node of namedExports) {
		const nodeWithProps = node as ExportNodeWithProps;
		const declaration = nodeWithProps.declaration;
		const sourceValue = nodeWithProps.source?.value;

		// export const x = 1
		if (declaration) {
			if (declaration.type === "VariableDeclaration") {
				for (const declarator of declaration.declarations || []) {
					const exportInfo: ExportInfo = {
						name: declarator.id?.name || "unknown",
						isDefault: false,
						isNamed: true,
					};
					if (sourceValue !== undefined) {
						exportInfo.source = sourceValue;
					}
					exports.push(exportInfo);
				}
			} else if (
				declaration.type === "FunctionDeclaration"
				|| declaration.type === "ClassDeclaration"
			) {
				const exportInfo: ExportInfo = {
					name: declaration.id?.name || "unknown",
					isDefault: false,
					isNamed: true,
				};
				if (sourceValue !== undefined) {
					exportInfo.source = sourceValue;
				}
				exports.push(exportInfo);
			}
		}

		// export { x, y }
		const specifiers = nodeWithProps.specifiers;
		if (Array.isArray(specifiers)) {
			for (const spec of specifiers) {
				const exportInfo: ExportInfo = {
					name: spec.exported?.name || spec.local?.name || "unknown",
					isDefault: false,
					isNamed: true,
				};
				if (sourceValue !== undefined) {
					exportInfo.source = sourceValue;
				}
				exports.push(exportInfo);
			}
		}
	}

	// Find default exports
	const defaultExports = findNodesByType(ast, "ExportDefaultDeclaration");
	for (const node of defaultExports) {
		const nodeWithProps = node as ExportNodeWithProps;
		const declaration = nodeWithProps.declaration;
		let name = "default";

		if (declaration) {
			if (declaration.type === "Identifier") {
				const identNode = declaration as unknown as { name?: string };
				name = identNode.name || "default";
			} else if (
				declaration.type === "FunctionDeclaration"
				|| declaration.type === "ClassDeclaration"
			) {
				name = declaration.id?.name || "default";
			}
		}

		const exportInfo: ExportInfo = {
			name,
			isDefault: true,
			isNamed: false,
		};
		exports.push(exportInfo);
	}

	return exports;
};

/**
 * Find all export names
 */
export const findExportNames = (ast: unknown): string[] => {
	return findExports(ast).map((exp) => exp.name);
};

/**
 * Check if module has default export
 */
export const hasDefaultExport = (ast: unknown): boolean => {
	return findExports(ast).some((exp) => exp.isDefault);
};
