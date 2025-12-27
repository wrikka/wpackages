// Result type for error handling
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// File stats
export type FileStats = {
	readonly size: number;
	readonly createdAt: Date;
	readonly modifiedAt: Date;
	readonly isFile: boolean;
	readonly isDirectory: boolean;
	readonly permissions: number;
};

// Directory entry
export type DirectoryEntry = {
	readonly name: string;
	readonly path: string;
	readonly isFile: boolean;
	readonly isDirectory: boolean;
	readonly size?: number;
};

// File encoding
export type FileEncoding = "utf8" | "utf-8" | "ascii" | "base64" | "binary";

// File system operations
export type FileSystem = {
	// Read operations
	readonly readFile: (
		path: string,
		encoding?: FileEncoding,
	) => Promise<Result<string, Error>>;
	readonly readFileBuffer: (path: string) => Promise<Result<Buffer, Error>>;
	readonly readDir: (
		path: string,
	) => Promise<Result<readonly DirectoryEntry[], Error>>;
	readonly exists: (path: string) => Promise<Result<boolean, Error>>;
	readonly stat: (path: string) => Promise<Result<FileStats, Error>>;

	// Write operations
	readonly writeFile: (
		path: string,
		content: string,
		encoding?: FileEncoding,
	) => Promise<Result<void, Error>>;
	readonly appendFile: (
		path: string,
		content: string,
	) => Promise<Result<void, Error>>;
	readonly mkdir: (
		path: string,
		recursive?: boolean,
	) => Promise<Result<void, Error>>;
	readonly remove: (path: string) => Promise<Result<void, Error>>;
	readonly copy: (src: string, dest: string) => Promise<Result<void, Error>>;
	readonly move: (src: string, dest: string) => Promise<Result<void, Error>>;

	// Watch operations
	readonly watch: (
		path: string,
		callback: (event: FileSystemEvent) => void,
	) => Promise<Result<() => void, Error>>;
};

// File system event
export type FileSystemEvent = {
	readonly type: "change" | "rename" | "delete";
	readonly path: string;
	readonly timestamp: number;
};

// Path info
export type PathInfo = {
	readonly dirname: string;
	readonly basename: string;
	readonly extname: string;
	readonly filename: string;
};
