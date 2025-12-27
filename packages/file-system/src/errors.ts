export class FileSystemError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "FileSystemError";
	}
}

export class FileNotFoundError extends FileSystemError {
	constructor(path: string) {
		super(`File not found at path: ${path}`);
		this.name = "FileNotFoundError";
	}
}

export class DirectoryExistsError extends FileSystemError {
	constructor(path: string) {
		super(`Directory already exists at path: ${path}`);
		this.name = "DirectoryExistsError";
	}
}

export class NotADirectoryError extends FileSystemError {
	constructor(path: string) {
		super(`Path is not a directory: ${path}`);
		this.name = "NotADirectoryError";
	}
}

export class NotAFileError extends FileSystemError {
	constructor(path: string) {
		super(`Path is not a file: ${path}`);
		this.name = "NotAFileError";
	}
}
