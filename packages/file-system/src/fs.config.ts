import { DEFAULT_ENCODING } from "./constant/defaults.const";
import type { FileEncoding } from "./types/fs";

export type FileSystemConfig = {
	readonly encoding: FileEncoding;
	readonly createMissingDirectories: boolean;
	readonly overwriteExisting: boolean;
};

export const createFileSystemConfig = (
	options: Partial<FileSystemConfig> = {},
): FileSystemConfig => ({
	createMissingDirectories: options.createMissingDirectories ?? true,
	encoding: options.encoding ?? DEFAULT_ENCODING,
	overwriteExisting: options.overwriteExisting ?? false,
});
