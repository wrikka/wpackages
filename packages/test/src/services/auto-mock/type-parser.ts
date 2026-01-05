import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

import { mapTypeToString } from "./type-mapper";
import type { TypeConstructor, TypeDefinition, TypeParameter } from "./types";

export class TypeDefinitionParser {
	// Parse TypeScript definition file
	public parseTypeDefinition(content: string): TypeDefinition {
		try {
			const ast = parse(content, {
				sourceType: "module",
				plugins: ["typescript", "decorators-legacy"],
			});

			const typeDef: TypeDefinition = {
				name: "Unknown",
				properties: {},
				methods: {},
			};

			traverse(ast, {
				ExportNamedDeclaration: (path) => {
					const declaration = path.node.declaration;
					if (declaration?.type === "ClassDeclaration") {
						this.extractClassInfo(declaration as any, typeDef);
					} else if (declaration?.type === "TSInterfaceDeclaration") {
						this.extractInterfaceInfo(declaration as any, typeDef);
					} else if (declaration?.type === "TSModuleDeclaration") {
						this.extractModuleInfo(declaration as any, typeDef);
					}
				},
				ExportDefaultDeclaration: (path) => {
					const declaration = path.node.declaration;
					if (declaration?.type === "ClassDeclaration") {
						this.extractClassInfo(declaration as any, typeDef);
					} else if (declaration?.type === "TSInterfaceDeclaration") {
						this.extractInterfaceInfo(declaration as any, typeDef);
					}
				},
			});

			return typeDef;
		} catch (error) {
			console.warn("Failed to parse type definition:", error);
			return this.createFallbackTypeDefinition();
		}
	}

	private extractClassInfo(node: any, typeDef: TypeDefinition): void {
		if (node.id?.name) {
			typeDef.name = node.id.name;
		}

		// Extract class members
		for (const member of node.body?.body || []) {
			if (member.type === "ClassProperty") {
				this.extractPropertyInfo(member, typeDef);
			} else if (member.type === "MethodDefinition") {
				this.extractMethodInfo(member, typeDef);
			} else if (member.type === "Constructor") {
				this.extractConstructorInfo(member, typeDef);
			}
		}
	}

	private extractInterfaceInfo(node: any, typeDef: TypeDefinition): void {
		if (node.id?.name) {
			typeDef.name = node.id.name;
		}

		// Extract interface members
		for (const member of node.body?.body || []) {
			if (member.type === "TSPropertySignature") {
				this.extractPropertySignature(member, typeDef);
			} else if (member.type === "TSMethodSignature") {
				this.extractMethodSignature(member, typeDef);
			}
		}
	}

	private extractModuleInfo(node: any, typeDef: TypeDefinition): void {
		// Extract module exports
		for (const member of node.body?.body || []) {
			if (member.type === "ExportNamedDeclaration") {
				if (member.declaration?.type === "VariableDeclaration") {
					this.extractVariableInfo(member.declaration, typeDef);
				} else if (member.declaration?.type === "FunctionDeclaration") {
					this.extractFunctionInfo(member.declaration, typeDef);
				}
			}
		}
	}

	private extractPropertyInfo(node: any, typeDef: TypeDefinition): void {
		const propertyName = node.key?.name || "unknown";
		const typeAnnotation = node.typeAnnotation?.typeAnnotation?.type || "any";
		const optional = !!node.optional;

		typeDef.properties[propertyName] = {
			type: mapTypeToString(typeAnnotation),
			optional,
		};
	}

	private extractMethodInfo(node: any, typeDef: TypeDefinition): void {
		const methodName = node.key?.name || "unknown";
		const returnType = mapTypeToString(
			node.returnType?.typeAnnotation?.typeAnnotation || "any",
		);
		const async = !!node.async;
		const generator = !!node.generator;

		const parameters: TypeParameter[] = [];
		for (const param of node.params || []) {
			parameters.push({
				name: param.name || "param",
				type: mapTypeToString(param.typeAnnotation?.typeAnnotation?.type || "any"),
				optional: !!param.optional,
			});
		}

		typeDef.methods[methodName] = {
			name: methodName,
			parameters,
			returnType,
			async,
			generator,
		};
	}

	private extractConstructorInfo(node: any, typeDef: TypeDefinition): void {
		const parameters: TypeParameter[] = [];
		for (const param of node.params || []) {
			parameters.push({
				name: param.name || "param",
				type: mapTypeToString(param.typeAnnotation?.typeAnnotation?.type || "any"),
				optional: !!param.optional,
			});
		}

		if (!typeDef.constructors) {
			typeDef.constructors = [];
		}

		typeDef.constructors.push({ parameters } as TypeConstructor);
	}

	private extractPropertySignature(node: any, typeDef: TypeDefinition): void {
		const propertyName = node.key?.name || "unknown";
		const typeAnnotation = node.typeAnnotation?.type || "any";
		const optional = !!node.optional;

		typeDef.properties[propertyName] = {
			type: mapTypeToString(typeAnnotation),
			optional,
		};
	}

	private extractMethodSignature(node: any, typeDef: TypeDefinition): void {
		const methodName = node.key?.name || "unknown";
		const returnType = mapTypeToString(node.typeAnnotation?.type || "any");

		const parameters: TypeParameter[] = [];
		for (const param of node.parameters || []) {
			parameters.push({
				name: param.name || "param",
				type: mapTypeToString(param.typeAnnotation?.type || "any"),
				optional: !!param.optional,
			});
		}

		typeDef.methods[methodName] = {
			name: methodName,
			parameters,
			returnType,
		};
	}

	private extractVariableInfo(node: any, typeDef: TypeDefinition): void {
		for (const declarator of node.declarations || []) {
			const variableName = declarator.id?.name || "unknown";
			const typeAnnotation = declarator.id?.typeAnnotation?.typeAnnotation?.type || "any";

			typeDef.properties[variableName] = {
				type: mapTypeToString(typeAnnotation),
				optional: false,
			};
		}
	}

	private extractFunctionInfo(node: any, typeDef: TypeDefinition): void {
		const functionName = node.id?.name || "unknown";
		const returnType = mapTypeToString(node.returnType?.typeAnnotation?.typeAnnotation || "any");

		const parameters: TypeParameter[] = [];
		for (const param of node.params || []) {
			parameters.push({
				name: param.name || "param",
				type: mapTypeToString(param.typeAnnotation?.typeAnnotation?.type || "any"),
				optional: !!param.optional,
			});
		}

		typeDef.methods[functionName] = {
			name: functionName,
			parameters,
			returnType,
		};
	}

	private createFallbackTypeDefinition(): TypeDefinition {
		return {
			name: "Fallback",
			properties: {
				mock: { type: "boolean", optional: false },
			},
			methods: {
				mockMethod: {
					name: "mockMethod",
					parameters: [],
					returnType: "any",
				},
			},
		};
	}
}
