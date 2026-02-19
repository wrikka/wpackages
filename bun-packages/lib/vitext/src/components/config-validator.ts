/**
 * Pure configuration validation functions
 */

import type { BuildConfig, ServerConfig, VitextConfig } from "../types/config";

/**
 * Validate server configuration
 */
export const validateServerConfig = (config: ServerConfig): { valid: boolean; errors: string[] } => {
	const errors: string[] = [];

	if (config.port < 1 || config.port > 65535) {
		errors.push(`Invalid port: ${config.port}. Port must be between 1 and 65535.`);
	}

	if (!config.hostname || typeof config.hostname !== "string") {
		errors.push("Hostname must be a non-empty string.");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
};

/**
 * Validate build configuration
 */
export const validateBuildConfig = (config: BuildConfig): { valid: boolean; errors: string[] } => {
	const errors: string[] = [];

	if (!config.outDir || typeof config.outDir !== "string") {
		errors.push("outDir must be a non-empty string.");
	}

	if (!config.assetsDir || typeof config.assetsDir !== "string") {
		errors.push("assetsDir must be a non-empty string.");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
};

/**
 * Validate complete Vitext configuration
 */
export const validateVitextConfig = (config: VitextConfig): { valid: boolean; errors: string[] } => {
	const errors: string[] = [];

	// Validate server config
	const serverValidation = validateServerConfig(config.server);
	if (!serverValidation.valid) {
		errors.push(...serverValidation.errors);
	}

	// Validate build config
	const buildValidation = validateBuildConfig(config.build);
	if (!buildValidation.valid) {
		errors.push(...buildValidation.errors);
	}

	// Validate root path
	if (!config.root || typeof config.root !== "string") {
		errors.push("root must be a non-empty string.");
	}

	// Validate base path
	if (typeof config.base !== "string") {
		errors.push("base must be a string.");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
};
