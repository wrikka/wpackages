import { describe, expect, it } from "vitest";
import { findNode, findNodes, findNodesByType, traverse } from "./ast-traverse.util";

describe("ast-traverse", () => {
	const mockAST = {
		type: "Program",
		body: [
			{
				type: "VariableDeclaration",
				declarations: [
					{
						type: "VariableDeclarator",
						id: { type: "Identifier", name: "x" },
					},
				],
			},
			{
				type: "FunctionDeclaration",
				id: { type: "Identifier", name: "foo" },
			},
		],
	};

	it("should traverse all nodes", () => {
		const visited: string[] = [];
		traverse(mockAST, (node) => {
			visited.push(node.type);
		});

		expect(visited).toContain("Program");
		expect(visited).toContain("VariableDeclaration");
		expect(visited).toContain("FunctionDeclaration");
		expect(visited).toContain("Identifier");
	});

	it("should find nodes by predicate", () => {
		const identifiers = findNodes(
			mockAST,
			(node) => node.type === "Identifier",
		);
		expect(identifiers.length).toBeGreaterThan(0);
		expect(identifiers.every((node) => node.type === "Identifier")).toBe(true);
	});

	it("should find first node", () => {
		const func = findNode(
			mockAST,
			(node) => node.type === "FunctionDeclaration",
		);
		expect(func).toBeDefined();
		expect(func?.type).toBe("FunctionDeclaration");
	});

	it("should find nodes by type", () => {
		const identifiers = findNodesByType(mockAST, "Identifier");
		expect(identifiers.length).toBeGreaterThan(0);
	});

	it("should stop traversal when visitor returns false", () => {
		const visited: string[] = [];
		traverse(mockAST, (node) => {
			visited.push(node.type);
			if (node.type === "VariableDeclaration") {
				return false;
			}
		});

		expect(visited).toContain("Program");
		expect(visited).toContain("VariableDeclaration");
		// Should not visit children of VariableDeclaration
		expect(visited.filter((t) => t === "VariableDeclarator").length).toBe(0);
	});
});
