import { Data } from "effect";
import * as ts from "typescript";

export class SemanticLinterError extends Data.TaggedError("SemanticLinterError")<{
	message: string;
	cause?: unknown;
}> {}

export interface SemanticError {
	fileName: string;
	line: number;
	character: number;
	message: string;
}

export interface SemanticRuleContext {
	sourceFile: ts.SourceFile;
	program: ts.Program;
	report: (error: Omit<SemanticError, "fileName">) => void;
}

export interface SemanticRule {
	name: string;
	create: (context: SemanticRuleContext) => ts.Visitor;
}
