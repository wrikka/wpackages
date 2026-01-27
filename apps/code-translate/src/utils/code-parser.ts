export const extractImports = (code: string): string[] => {
	const importRegex = /(?:import|require|from)\s+['"]([^'"]+)['"]/g;
	const imports: string[] = [];
	let match;
	while ((match = importRegex.exec(code)) !== null) {
		if (match[1]) {
			imports.push(match[1]);
		}
	}
	return imports;
};

export const extractComments = (code: string): string[] => {
	const commentRegex = /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm;
	const comments: string[] = [];
	let match;
	while ((match = commentRegex.exec(code)) !== null) {
		if (match[1]) {
			comments.push(match[1].trim());
		}
	}
	return comments;
};

export const removeComments = (code: string): string => {
	return code
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/\/\/.*$/gm, "")
		.replace(/#.*$/gm, "");
};

export const extractFunctions = (code: string): string[] => {
	const functionRegex = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:function|\([^)]*\)\s*=>))/g;
	const functions: string[] = [];
	let match;
	while ((match = functionRegex.exec(code)) !== null) {
		const name = match[1] || match[2];
		if (name) {
			functions.push(name);
		}
	}
	return functions;
};

export const extractClasses = (code: string): string[] => {
	const classRegex = /class\s+(\w+)/g;
	const classes: string[] = [];
	let match;
	while ((match = classRegex.exec(code)) !== null) {
		if (match[1]) {
			classes.push(match[1]);
		}
	}
	return classes;
};

export const extractInterfaces = (code: string): string[] => {
	const interfaceRegex = /(?:interface|type)\s+(\w+)/g;
	const interfaces: string[] = [];
	let match;
	while ((match = interfaceRegex.exec(code)) !== null) {
		if (match[1]) {
			interfaces.push(match[1]);
		}
	}
	return interfaces;
};

export const countLines = (code: string): number => {
	return code.split("\n").length;
};

export const countCharacters = (code: string): number => {
	return code.length;
};

export const countWords = (code: string): number => {
	return code.trim().split(/\s+/).filter(Boolean).length;
};

export const detectIndentation = (code: string): string => {
	const match = code.match(/^(\s*)/m);
	if (!match || !match[1]) return "  ";
	const indent = match[1];
	if (indent.includes("\t")) return "\t";
	return " ".repeat(Math.max(2, indent.length));
};

export const normalizeIndentation = (code: string, indent: string = "  "): string => {
	const lines = code.split("\n");
	const currentIndent = detectIndentation(code);
	if (currentIndent === indent) return code;

	return lines
		.map((line) => {
			const leading = line.match(/^\s*/)?.[0] ?? "";
			const spaces = leading.length;
			const indentCount = Math.floor(spaces / currentIndent.length);
			return indent.repeat(indentCount) + line.trimStart();
		})
		.join("\n");
};

export const isCodeValid = (code: string): boolean => {
	if (!code || code.trim().length === 0) return false;
	return true;
};

export const sanitizeCode = (code: string): string => {
	return code.trim();
};
