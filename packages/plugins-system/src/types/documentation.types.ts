export interface DocumentationOptions {
	readonly format: "markdown" | "html" | "json";
	readonly outputDir: string;
	readonly includeExamples?: boolean;
	readonly includeTypes?: boolean;
	readonly theme?: string;
}

export interface APIDocumentation {
	readonly name: string;
	readonly description?: string;
	readonly version: string;
	readonly methods: readonly MethodDocumentation[];
	readonly events: readonly EventDocumentation[];
	readonly types: readonly TypeDocumentation[];
}

export interface MethodDocumentation {
	readonly name: string;
	readonly description?: string;
	readonly parameters: readonly ParameterDocumentation[];
	readonly returnType: string;
	readonly example?: string;
}

export interface ParameterDocumentation {
	readonly name: string;
	readonly type: string;
	readonly description?: string;
	readonly optional?: boolean;
	readonly defaultValue?: unknown;
}

export interface EventDocumentation {
	readonly name: string;
	readonly description?: string;
	readonly payload?: string;
	readonly example?: string;
}

export interface TypeDocumentation {
	readonly name: string;
	readonly description?: string;
	readonly properties?: readonly PropertyDocumentation[];
	readonly example?: string;
}

export interface PropertyDocumentation {
	readonly name: string;
	readonly type: string;
	readonly description?: string;
	readonly optional?: boolean;
}

export interface DocumentationGenerator {
	readonly generate: (plugin: unknown, options: DocumentationOptions) => Promise<void>;
	readonly generateAPIDocs: (plugin: unknown) => APIDocumentation;
	readonly generateMarkdown: (docs: APIDocumentation) => string;
	readonly generateHTML: (docs: APIDocumentation) => string;
	readonly generateJSON: (docs: APIDocumentation) => string;
}
