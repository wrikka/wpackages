import path from "path";

export function extractInterfaces(code: string): string[] {
	const interfaceRegex = /interface\s+(\w+)\s*{([^}]*)}/g;
	const interfaces: string[] = [];
	let match;

	while ((match = interfaceRegex.exec(code)) !== null) {
		interfaces.push(match[0]);
	}

	return interfaces;
}

export function extractTypes(code: string): string[] {
	const typeRegex = /type\s+(\w+)\s*=\s*([^;]+);/g;
	const types: string[] = [];
	let match;

	while ((match = typeRegex.exec(code)) !== null) {
		types.push(match[0]);
	}

	return types;
}

export async function createTsHtmlContent(filePath: string, code: string) {
	const fileName = path.basename(filePath);
	const interfaces = extractInterfaces(code);
	const types = extractTypes(code);

	// Create markdown content
	let markdown = `# TypeScript File: ${fileName}\n\n`;

	if (interfaces.length > 0) {
		markdown += `## Interfaces\n\n`;
		for (const iface of interfaces) {
			markdown += `\`\`\`typescript\n${iface}\n\`\`\`\n\n`;
		}
	}

	if (types.length > 0) {
		markdown += `## Types\n\n`;
		for (const type of types) {
			markdown += `\`\`\`typescript\n${type}\n\`\`\`\n\n`;
		}
	}

	markdown += `## Full Code\n\n\`\`\`typescript\n${code}\n\`\`\`\n`;

	return markdown;
}
