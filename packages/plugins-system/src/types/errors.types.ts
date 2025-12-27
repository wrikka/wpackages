export class PluginError extends Error {
	public readonly pluginId: string;
	public readonly code: string;
	public override readonly cause?: unknown;

	constructor(
		message: string,
		pluginId: string,
		code: string,
		cause?: unknown,
	) {
		super(message);
		this.name = "PluginError";
		this.pluginId = pluginId;
		this.code = code;
		this.cause = cause;
	}
}

export class PluginValidationError extends PluginError {
	constructor(
		pluginId: string,
		public readonly validationErrors: readonly string[],
		cause?: unknown,
	) {
		super(
			`Plugin validation failed: ${validationErrors.join(", ")}`,
			pluginId,
			"VALIDATION_ERROR",
			cause,
		);
		this.name = "PluginValidationError";
	}
}

export class PluginDependencyError extends PluginError {
	constructor(
		pluginId: string,
		public readonly missingDependencies: readonly string[],
		cause?: unknown,
	) {
		super(
			`Missing dependencies: ${missingDependencies.join(", ")}`,
			pluginId,
			"DEPENDENCY_ERROR",
			cause,
		);
		this.name = "PluginDependencyError";
	}
}

export class PluginCircularDependencyError extends PluginError {
	constructor(
		public readonly cycle: readonly string[],
		cause?: unknown,
	) {
		super(
			`Circular dependency detected: ${cycle.join(" -> ")}`,
			cycle[0] ?? "unknown",
			"CIRCULAR_DEPENDENCY",
			cause,
		);
		this.name = "PluginCircularDependencyError";
	}
}

export class PluginLoadError extends PluginError {
	constructor(
		pluginId: string,
		public readonly path: string,
		cause?: unknown,
	) {
		super(`Failed to load plugin from ${path}`, pluginId, "LOAD_ERROR", cause);
		this.name = "PluginLoadError";
	}
}
