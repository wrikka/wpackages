import { createFileSystemConfig } from "./fs.config";
import { createFileSystem } from "./services/fs.service";

/**
 * Create and initialize file system application
 * Composes all layers: config → services → utilities
 */
export const createFileSystemApp = () => {
	const config = createFileSystemConfig();
	const fileSystem = createFileSystem(config);

	return {
		config,
		fileSystem,
	};
};

/**
 * Default file system instance
 */
export const defaultFileSystemApp = createFileSystemApp();
