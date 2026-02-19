export interface MockDefinition {
	modulePath: string;
	mockImplementation?: string;
	autoMock?: boolean;
	methods?: Record<string, string>;
}

export interface TypeDefinition {
	name: string;
	properties: Record<string, TypeProperty>;
	methods: Record<string, TypeMethod>;
	constructors?: TypeConstructor[];
}

export interface TypeProperty {
	type: string;
	optional: boolean;
	readonly?: boolean;
}

export interface TypeMethod {
	name: string;
	parameters: TypeParameter[];
	returnType: string;
	async?: boolean;
	generator?: boolean;
}

export interface TypeParameter {
	name: string;
	type: string;
	optional: boolean;
	defaultValue?: string;
}

export interface TypeConstructor {
	parameters: TypeParameter[];
}
