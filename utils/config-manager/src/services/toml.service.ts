/**
 * TOML Configuration Service
 * Provides TOML parsing and serialization capabilities
 */

import { parse as tomlParse, stringify as tomlStringify } from "@iarna/toml";
import { err, ok } from "@wpackages/functional";
import type { ResultType as Result } from "@wpackages/functional";
import { readFileSync, writeFileSync } from "node:fs";
import type { ConfigError } from "../types/config";
import {
	createConfigError,
	createFileErrorMessage,
	createParseErrorMessage,
	createSerializeErrorMessage,
} from "../utils/error-handler";

/**
 * Parse TOML content
 */
export const parseToml = <T extends Record<string, unknown>>(content: string): Result<ConfigError, T> => {
	try {
		const parsed = tomlParse(content);
		return ok(parsed as T);
	} catch (error) {
		return err(createConfigError(createParseErrorMessage("TOML", error), error));
	}
};

/**
 * Serialize to TOML
 */
export const serializeToml = <T extends Record<string, unknown>>(data: T): Result<ConfigError, string> => {
	try {
		const serialized = tomlStringify(data as Parameters<typeof tomlStringify>[0]);
		return ok(serialized);
	} catch (error) {
		return err(createConfigError(createSerializeErrorMessage("TOML", error), error));
	}
};

/**
 * Load TOML file
 */
export const loadTomlFile = <T extends Record<string, unknown>>(filePath: string): Result<ConfigError, T> => {
	try {
		const content = readFileSync(filePath, "utf-8");
		return parseToml<T>(content);
	} catch (error) {
		return err(createConfigError(createFileErrorMessage("read", filePath, error), error));
	}
};

/**
 * Save to TOML file
 */
export const saveTomlFile = <T extends Record<string, unknown>>(
	filePath: string,
	data: T,
): Result<ConfigError, void> => {
	try {
		const content = tomlStringify(data as Parameters<typeof tomlStringify>[0]);
		writeFileSync(filePath, content, "utf-8");
		return ok(undefined);
	} catch (error) {
		return err(createConfigError(createFileErrorMessage("write", filePath, error), error));
	}
};
