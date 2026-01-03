import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
	Project,
	type SourceFile,
	type FunctionDeclaration,
	type VariableDeclaration,
	type TypeAliasDeclaration,
	type InterfaceDeclaration,
	type ClassDeclaration,
} from "ts-morph";
import type { FileInfo } from "./types";

async function findTsConfig(targetDir: string): Promise<string> {
	const tsConfigFilePath = path.join(targetDir, "tsconfig.json");
	try {
		await fs.access(tsConfigFilePath);
		return tsConfigFilePath;
	} catch {
		throw new Error(`tsconfig.json not found in ${targetDir}`);
	}
}

function extractFileInfos(sourceFiles: SourceFile[]): FileInfo[] {
	return sourceFiles.map((sourceFile) => {
		const variables: {
			name: string;
			kind: string;
			type: string;
			code: string;
			line: number;
		}[] = [];

		type DeclerationWithName =
			| FunctionDeclaration
			| VariableDeclaration
			| TypeAliasDeclaration
			| InterfaceDeclaration
			| ClassDeclaration;

		const addVariable = (decl: DeclerationWithName, kind: string) => {
			const name = decl.getName();
			if (name) {
				variables.push({
					name,
					kind,
					type: decl.getType().getText(decl),
					code: decl.getText(),
					line: decl.getStartLineNumber(),
				});
			}
		};

		sourceFile.getFunctions().forEach((decl) => {
			addVariable(decl, "Function");
		});
		sourceFile.getVariableDeclarations().forEach((decl) => {
			addVariable(decl, "Variable");
		});
		sourceFile.getTypeAliases().forEach((decl) => {
			addVariable(decl, "Type Alias");
		});
		sourceFile.getInterfaces().forEach((decl) => {
			addVariable(decl, "Interface");
		});
		sourceFile.getClasses().forEach((decl) => {
			addVariable(decl, "Class");
		});

		return { path: sourceFile.getFilePath(), variables };
	});
}

export async function analyzeProject(dir: string): Promise<FileInfo[]> {
	const targetDir = path.resolve(dir);

	try {
		const tsConfigFilePath = await findTsConfig(targetDir);
		const project = new Project({ tsConfigFilePath });
		const sourceFiles = project.getSourceFiles();
		const fileInfos = extractFileInfos(sourceFiles);

		return fileInfos;
	} catch (error) {
		// Re-throw the error to be handled by the caller
		throw new Error(
			`Failed to analyze project at ${targetDir}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
