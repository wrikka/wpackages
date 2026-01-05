import fs from 'node:fs/promises';
import { parse } from '@wpackages/parser';
import type { FileNode, ImportSpecifier, ReExport } from '../types';

type AstNode = {
	type?: unknown;
	[key: string]: unknown;
};

function isAstNode(value: unknown): value is AstNode {
	return typeof value === 'object' && value !== null;
}

function isIdentifierLike(value: unknown): value is { name: string } {
	return isAstNode(value) && typeof value['name'] === 'string';
}

function isLiteralStringLike(value: unknown): value is { value: string } {
	return isAstNode(value) && typeof value['value'] === 'string';
}

/**
 * A simple recursive AST walker.
 */

function walk(node: unknown, visitor: { enter: (node: AstNode) => void }) {
	if (!isAstNode(node)) return;
	visitor.enter(node);
	for (const child of Object.values(node)) {
		if (Array.isArray(child)) {
			for (const item of child) {
				walk(item, visitor);
			}
			continue;
		}
		walk(child, visitor);
	}
}

/**
 * Parses a file and extracts its imports and exports.
 */
export async function analyzeFile(filePath: string): Promise<FileNode | null> {
	try {
		const content = await fs.readFile(filePath, 'utf-8');
		const ast = await parse(filePath, content) as unknown; // Assuming ESTree compatible

		const imports: ImportSpecifier[] = [];
		const reExports: ReExport[] = [];
		const exports = new Set<string>();

		walk(ast, {
			enter(node) {
				// import { a }, import a, import * as a from './b'
				const source = node['source'];
				if (node.type === 'ImportDeclaration' && isAstNode(source) && isLiteralStringLike(source)) {
					const modulePath = source['value'];
					const specifiers = new Set<string>();
					const rawSpecifiers = Array.isArray(node['specifiers']) ? node['specifiers'] : [];
					for (const spec of rawSpecifiers) {
						if (!isAstNode(spec)) continue;
						const imported = spec['imported'];
						if (spec.type === 'ImportSpecifier' && isAstNode(imported) && isIdentifierLike(imported)) {
							specifiers.add(imported['name']);
						} else if (spec.type === 'ImportDefaultSpecifier') {
							specifiers.add('default');
						} else if (spec.type === 'ImportNamespaceSpecifier') {
							specifiers.add('*');
						}
					}
					imports.push({ module: modulePath, specifiers });
				}
				// export * from './b'
				if (node.type === 'ExportAllDeclaration' && isAstNode(source) && isLiteralStringLike(source)) {
					reExports.push({
						module: source['value'],
						exportAll: true,
						specifiers: new Map(),
					});
				}
				// export { a } from './b'
				if (node.type === 'ExportNamedDeclaration' && isAstNode(source) && isLiteralStringLike(source)) {
					const specifiers = new Map<string, string>();
					const rawSpecifiers = Array.isArray(node['specifiers']) ? node['specifiers'] : [];
					for (const spec of rawSpecifiers) {
						if (!isAstNode(spec)) continue;
						const exported = spec['exported'];
						const local = spec['local'];
						if (!isIdentifierLike(exported) || !isIdentifierLike(local)) continue;
						specifiers.set(exported['name'], local['name']);
						exports.add(exported['name']);
					}
					reExports.push({ module: source['value'], exportAll: false, specifiers });
				}
				// export { a, b }
				if (node.type === 'ExportNamedDeclaration' && !source && Array.isArray(node['specifiers'])) {
					for (const specifier of node['specifiers']) {
						if (!isAstNode(specifier)) continue;
						const exported = specifier['exported'];
						if (!isIdentifierLike(exported)) continue;
						exports.add(exported['name']);
					}
				}
				// export default ...
				if (node.type === 'ExportDefaultDeclaration') {
					exports.add('default');
				}
				// export const a = 1
				const declarationNode = node['declaration'];
				if (node.type === 'ExportNamedDeclaration' && isAstNode(declarationNode) && Array.isArray(declarationNode['declarations'])) {
					for (const declaration of declarationNode['declarations']) {
						if (!isAstNode(declaration)) continue;
						const id = declaration['id'];
						if (!isAstNode(id) || !isIdentifierLike(id)) continue;
						exports.add(id['name']);
					}
				}

				// dynamic import('...')
				if (node.type === 'ImportExpression' && isAstNode(source) && source['type'] === 'Literal' && isLiteralStringLike(source)) {
					imports.push({ module: source['value'], specifiers: new Set(['*']) });
				}

				// require('...')
				if (
					node.type === 'CallExpression' &&
					isAstNode(node['callee']) &&
					node['callee']['type'] === 'Identifier' &&
					typeof node['callee']['name'] === 'string' &&
					node['callee']['name'] === 'require' &&
					Array.isArray(node['arguments']) &&
					node['arguments'].length === 1 &&
					isAstNode(node['arguments'][0]) &&
					node['arguments'][0]['type'] === 'Literal' &&
					isLiteralStringLike(node['arguments'][0])
				) {
					imports.push({ module: node['arguments'][0]['value'], specifiers: new Set(['*']) });
				}
			},
		});

		return { path: filePath, imports, reExports, exports };
	} catch (error) {
		console.warn(`Could not parse ${filePath}:`, error);
		return null;
	}
}
