import type { ContainerConfig } from "../types/container-simple";
import type { ContainerError } from "../types/error";
import { validationError } from "../types/error";

type Ok<T> = { _tag: "Ok"; value: T };
type Err<E> = { _tag: "Err"; error: E };
type Result<T, E> = Ok<T> | Err<E>;

const ok = <T, E = never>(value: T): Result<T, E> => ({ _tag: "Ok", value });
const err = <E, T = never>(error: E): Result<T, E> => ({ _tag: "Err", error });

export const validateContainerConfig = (
	config: unknown,
): Result<ContainerConfig, ContainerError> => {
	if (!config || typeof config !== "object") {
		return err(validationError("Config must be an object"));
	}

	const cfg = config as Record<string, unknown>;

	if (!cfg.workdir || typeof cfg.workdir !== "string") {
		return err(validationError("workdir is required and must be a string"));
	}

	if (cfg.workdir.trim() === "") {
		return err(validationError("workdir cannot be empty"));
	}

	if (cfg.name !== undefined && typeof cfg.name !== "string") {
		return err(validationError("name must be a string"));
	}

	if (cfg.shell !== undefined && typeof cfg.shell !== "string") {
		return err(validationError("shell must be a string"));
	}

	if (
		cfg.packageManager !== undefined
		&& typeof cfg.packageManager !== "string"
	) {
		return err(validationError("packageManager must be a string"));
	}

	if (
		cfg.autoDetectPackageManager !== undefined
		&& typeof cfg.autoDetectPackageManager !== "boolean"
	) {
		return err(validationError("autoDetectPackageManager must be a boolean"));
	}

	if (cfg.env !== undefined) {
		if (typeof cfg.env !== "object" || cfg.env === null) {
			return err(validationError("env must be an object"));
		}

		for (const [key, value] of Object.entries(cfg.env)) {
			if (typeof value !== "string") {
				return err(
					validationError(`env.${key} must be a string, got ${typeof value}`),
				);
			}
		}
	}

	if (cfg.resourceLimits !== undefined) {
		if (typeof cfg.resourceLimits !== "object" || cfg.resourceLimits === null) {
			return err(validationError("resourceLimits must be an object"));
		}

		const limits = cfg.resourceLimits as Record<string, unknown>;

		if (
			limits.timeout !== undefined
			&& (typeof limits.timeout !== "number" || limits.timeout <= 0)
		) {
			return err(
				validationError("resourceLimits.timeout must be a positive number"),
			);
		}

		if (
			limits.maxMemory !== undefined
			&& (typeof limits.maxMemory !== "number" || limits.maxMemory <= 0)
		) {
			return err(
				validationError("resourceLimits.maxMemory must be a positive number"),
			);
		}

		if (
			limits.maxCpu !== undefined
			&& (typeof limits.maxCpu !== "number"
				|| limits.maxCpu <= 0
				|| limits.maxCpu > 100)
		) {
			return err(
				validationError(
					"resourceLimits.maxCpu must be a number between 0 and 100",
				),
			);
		}
	}

	return ok(cfg as ContainerConfig);
};

export const validateWorkdir = (
	workdir: unknown,
): Result<string, ContainerError> => {
	if (typeof workdir !== "string") {
		return err(validationError("workdir must be a string"));
	}

	if (workdir.trim() === "") {
		return err(validationError("workdir cannot be empty"));
	}

	return ok(workdir);
};

export const validateContainerId = (
	id: unknown,
): Result<string, ContainerError> => {
	if (typeof id !== "string") {
		return err(validationError("Container ID must be a string"));
	}

	if (id.trim() === "") {
		return err(validationError("Container ID cannot be empty"));
	}

	return ok(id);
};

export const validatePackages = (
	packages: unknown,
): Result<string[], ContainerError> => {
	if (!Array.isArray(packages)) {
		return err(validationError("packages must be an array"));
	}

	for (const pkg of packages) {
		if (typeof pkg !== "string") {
			return err(validationError("all packages must be strings"));
		}

		if (pkg.trim() === "") {
			return err(validationError("package name cannot be empty"));
		}
	}

	return ok(packages);
};

export const validatePort = (port: unknown): Result<number, ContainerError> => {
	if (typeof port !== "number") {
		return err(validationError("port must be a number"));
	}

	if (port < 1 || port > 65535) {
		return err(validationError("port must be between 1 and 65535"));
	}

	if (!Number.isInteger(port)) {
		return err(validationError("port must be an integer"));
	}

	return ok(port);
};
