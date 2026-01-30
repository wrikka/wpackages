// Based on Fig's completion spec schema

export interface Suggestion {
	name: string | string[];
	description?: string;
	insertValue?: string;
	icon?: string; // URL or emoji
	type?: "subcommand" | "option" | "argument" | "shortcut" | "special";
	isDangerous?: boolean;
}

export interface Subcommand extends Suggestion {
	subcommands?: Subcommand[];
	options?: Option[];
	args?: Arg[];
}

export interface Option extends Suggestion {
	args?: Arg[];
}

export interface Arg {
	name: string;
	description?: string;
	isOptional?: boolean;
	isVariadic?: boolean;
	suggestions?: Suggestion[];
	generators?: Generator | Generator[];
}

export interface CompletionSpec {
	name: string;
	description?: string;
	subcommands?: Subcommand[];
	options?: Option[];
	args?: Arg[];
	generators?: Generator | Generator[];
}

export interface Generator {
	template: "filepaths" | "folders";
}
