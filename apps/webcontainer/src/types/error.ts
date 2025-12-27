export type ContainerErrorCode =
	| "INVALID_CONFIG"
	| "CONTAINER_NOT_FOUND"
	| "CONTAINER_ALREADY_RUNNING"
	| "CONTAINER_NOT_RUNNING"
	| "CONTAINER_ALREADY_STOPPED"
	| "COMMAND_FAILED"
	| "INSTALL_FAILED"
	| "FILE_NOT_FOUND"
	| "FILE_OPERATION_FAILED"
	| "PORT_ALREADY_REGISTERED"
	| "PORT_NOT_FOUND"
	| "VALIDATION_ERROR"
	| "UNKNOWN_ERROR";

export type ContainerError = {
	readonly code: ContainerErrorCode;
	readonly message: string;
	readonly details?: unknown;
};

export const createError = (
	code: ContainerErrorCode,
	message: string,
	details?: unknown,
): ContainerError => ({
	code,
	details,
	message,
});

export const invalidConfigError = (message: string): ContainerError => createError("INVALID_CONFIG", message);

export const containerNotFoundError = (id: string): ContainerError =>
	createError("CONTAINER_NOT_FOUND", `Container ${id} not found`);

export const containerAlreadyRunningError = (id: string): ContainerError =>
	createError(
		"CONTAINER_ALREADY_RUNNING",
		`Container ${id} is already running`,
	);

export const containerNotRunningError = (id: string): ContainerError =>
	createError(
		"CONTAINER_NOT_RUNNING",
		`Container ${id} is not running. Call start() first.`,
	);

export const commandFailedError = (
	command: string,
	stderr: string,
): ContainerError => createError("COMMAND_FAILED", `Command failed: ${command}`, { stderr });

export const validationError = (message: string): ContainerError => createError("VALIDATION_ERROR", message);
