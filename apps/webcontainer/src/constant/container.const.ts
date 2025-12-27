export const DEFAULT_TIMEOUT = 60000 as const;
export const DEFAULT_CONTAINER_PREFIX = "container" as const;
export const DEFAULT_SHELL = "bash" as const;
export const DEFAULT_PACKAGE_MANAGER = "npm" as const;

export const CONTAINER_STATUS = {
	ERROR: "error",
	IDLE: "idle",
	RUNNING: "running",
	STOPPED: "stopped",
} as const;

export const PORT_STATUS = {
	CLOSED: "closed",
	OPEN: "open",
} as const;

export const PROCESS_STATUS = {
	RUNNING: "running",
	STOPPED: "stopped",
} as const;
