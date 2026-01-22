import * as ts from "typescript";
import { SemanticRule } from "../../types/semantic";

export const noMixedTypeComparison: SemanticRule = {
	name: "no-mixed-type-comparison",
	create: (context) => {
		const typeChecker = context.program.getTypeChecker();

		function visit(node: ts.Node): ts.Node {
			if (ts.isBinaryExpression(node)) {
				const leftType = typeChecker.getApparentType(typeChecker.getTypeAtLocation(node.left));
				const rightType = typeChecker.getApparentType(typeChecker.getTypeAtLocation(node.right));

				const isLeftString = (leftType.flags & ts.TypeFlags.StringLike) !== 0;
				const isRightString = (rightType.flags & ts.TypeFlags.StringLike) !== 0;

				const isLeftNumber = (leftType.flags & ts.TypeFlags.NumberLike) !== 0;
				const isRightNumber = (rightType.flags & ts.TypeFlags.NumberLike) !== 0;

				if ((isLeftString && isRightNumber) || (isLeftNumber && isRightString)) {
					const { line, character } = context.sourceFile.getLineAndCharacterOfPosition(node.getStart());
					context.report({
						line: line + 1,
						character: character + 1,
						message: "Comparison between string and number is not allowed.",
					});
				}
			}
			ts.forEachChild(node, visit);
			return node;
		}

		return (node: ts.Node) => ts.visitNode(node, visit);
	},
};
