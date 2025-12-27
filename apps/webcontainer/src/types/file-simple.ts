export type FileOperationType = "read" | "write" | "delete" | "copy" | "move";

export type FileOperation = {
	readonly type: FileOperationType;
	readonly path: string;
	readonly content?: string;
	readonly destination?: string;
};

export type FileInfo = {
	readonly path: string;
	readonly name: string;
	readonly size: number;
	readonly isDirectory: boolean;
	readonly modifiedAt: number;
};
