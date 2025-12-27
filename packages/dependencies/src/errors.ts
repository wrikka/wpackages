/**
 * Package manager not found error
 */
export class PackageManagerNotFoundError extends Error {
	override readonly name = "PackageManagerNotFoundError";

	constructor(message: string = "Package manager not found") {
		super(message);
		Object.setPrototypeOf(this, PackageManagerNotFoundError.prototype);
	}
}

/**
 * Command execution error
 */
export class CommandExecutionError extends Error {
	override readonly name = "CommandExecutionError";
	readonly exitCode: number;
	readonly command: string;

	constructor(message: string, exitCode: number, command: string) {
		super(message);
		this.exitCode = exitCode;
		this.command = command;
		Object.setPrototypeOf(this, CommandExecutionError.prototype);
	}
}

/**
 * Invalid package error
 */
export class InvalidPackageError extends Error {
	override readonly name = "InvalidPackageError";
	readonly packageName: string;

	constructor(message: string, packageName: string) {
		super(message);
		this.packageName = packageName;
		Object.setPrototypeOf(this, InvalidPackageError.prototype);
	}
}

/**
 * Configuration error
 */
export class ConfigurationError extends Error {
	override readonly name = "ConfigurationError";

	constructor(message: string = "Configuration error") {
		super(message);
		Object.setPrototypeOf(this, ConfigurationError.prototype);
	}
}

/**
 * Type guard for CommandExecutionError
 */
export function isCommandExecutionError(error: unknown): error is CommandExecutionError {
	return error instanceof CommandExecutionError;
}

/**
 * Type guard for PackageManagerNotFoundError
 */
export function isPackageManagerNotFoundError(error: unknown): error is PackageManagerNotFoundError {
	return error instanceof PackageManagerNotFoundError;
}

/**
 * Type guard for InvalidPackageError
 */
export function isInvalidPackageError(error: unknown): error is InvalidPackageError {
	return error instanceof InvalidPackageError;
}

/**
 * Type guard for ConfigurationError
 */
export function isConfigurationError(error: unknown): error is ConfigurationError {
	return error instanceof ConfigurationError;
}
