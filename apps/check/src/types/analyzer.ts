export interface VariableInfo {
	name: string;
	type: string;
	kind: string;
	code: string;
	line: number;
}

export interface FileInfo {
	path: string;
	variables: VariableInfo[];
}
