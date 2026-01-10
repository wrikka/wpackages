import type {
	APIDocumentation,
	DocumentationGenerator,
	DocumentationOptions,
	EventDocumentation,
	MethodDocumentation,
	ParameterDocumentation,
	PropertyDocumentation,
	TypeDocumentation,
} from "../types/documentation.types";

export const createDocumentationGenerator = (): DocumentationGenerator => {
	const generate = async (plugin: unknown, options: DocumentationOptions): Promise<void> => {
		const docs = generateAPIDocs(plugin);
		let content = "";

		switch (options.format) {
			case "markdown":
				content = generateMarkdown(docs);
				break;
			case "html":
				content = generateHTML(docs);
				break;
			case "json":
				content = generateJSON(docs);
				break;
		}

		console.log(`Documentation generated for ${docs.name}`);
	};

	const generateAPIDocs = (plugin: unknown): APIDocumentation => {
		const pluginObj = plugin as Record<string, unknown>;
		const metadata = pluginObj.metadata as { readonly name: string; readonly version: string; readonly description?: string };

		return {
			name: metadata?.name ?? "Unknown Plugin",
			description: metadata?.description,
			version: metadata?.version ?? "0.0.0",
			methods: extractMethods(pluginObj),
			events: extractEvents(pluginObj),
			types: extractTypes(pluginObj),
		};
	};

	const extractMethods = (plugin: Record<string, unknown>): readonly MethodDocumentation[] => {
		const methods: MethodDocumentation[] = [];

		for (const [key, value] of Object.entries(plugin)) {
			if (typeof value === "function" && key !== "init" && !key.startsWith("on")) {
				methods.push({
					name: key,
					description: `Method ${key}`,
					parameters: [],
					returnType: "unknown",
				});
			}
		}

		return Object.freeze(methods);
	};

	const extractEvents = (_plugin: Record<string, unknown>): readonly EventDocumentation[] => {
		return Object.freeze([]);
	};

	const extractTypes = (_plugin: Record<string, unknown>): readonly TypeDocumentation[] => {
		return Object.freeze([]);
	};

	const generateMarkdown = (docs: APIDocumentation): string => {
		let md = `# ${docs.name}\n\n`;
		md += `Version: ${docs.version}\n\n`;

		if (docs.description) {
			md += `${docs.description}\n\n`;
		}

		if (docs.methods.length > 0) {
			md += "## Methods\n\n";
			for (const method of docs.methods) {
				md += `### ${method.name}\n\n`;
				if (method.description) {
					md += `${method.description}\n\n`;
				}
				md += `**Returns:** \`${method.returnType}\`\n\n`;
			}
		}

		return md;
	};

	const generateHTML = (docs: APIDocumentation): string => {
		let html = `<!DOCTYPE html>\n<html>\n<head>\n<title>${docs.name} API</title>\n</head>\n<body>\n`;
		html += `<h1>${docs.name}</h1>\n`;
		html += `<p>Version: ${docs.version}</p>\n`;

		if (docs.description) {
			html += `<p>${docs.description}</p>\n`;
		}

		html += "</body>\n</html>";
		return html;
	};

	const generateJSON = (docs: APIDocumentation): string => {
		return JSON.stringify(docs, null, 2);
	};

	return Object.freeze({
		generate,
		generateAPIDocs,
		generateMarkdown,
		generateHTML,
		generateJSON,
	});
};
