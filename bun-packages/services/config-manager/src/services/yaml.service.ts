/**
 * YAML Configuration Service
 * Provides YAML parsing and serialization capabilities
 */

import { err, ok } from "@wpackages/functional";
import type { ResultType as Result } from "@wpackages/functional";
import { readFileSync, writeFileSync } from "node:fs";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import type { ConfigError } from "../types/config";
import {
	createConfigError,
	createFileErrorMessage,
	createParseErrorMessage,
	createSerializeErrorMessage,
} from "../utils/error-handler";

/**
 * Parse YAML content
 */
export const parseYaml = <T>(content: string): Result<ConfigError, T> => {
	try {
		const parsed = yamlParse(content);
		return ok(parsed as T);
	} catch (error) {
		return err(createConfigError(createParseErrorMessage("YAML", error), error));
	}
};

/**
 * Serialize to YAML
 */
export const serializeYaml = <T>(data: T): Result<ConfigError, string> => {
	try {
		const serialized = yamlStringify(data, { indent: 2 });
		return ok(serialized);
	} catch (error) {
		return err(createConfigError(createSerializeErrorMessage("YAML", error), error));
	}
};

/**
 * Load YAML file
 */
export const loadYamlFile = <T>(filePath: string): Result<ConfigError, T> => {
	try {
		const content = readFileSync(filePath, "utf-8");
		return parseYaml<T>(content);
	} catch (error) {
		return err(createConfigError(createFileErrorMessage("read", filePath, error), error));
	}
};

/**
 * Save to YAML file
 */
export const saveYamlFile = <T>(filePath: string, data: T): Result<ConfigError, void> => {
	try {
		const content = yamlStringify(data, { indent: 2 });
		writeFileSync(filePath, content, "utf-8");
		return ok(undefined);
	} catch (error) {
		return err(createConfigError(createFileErrorMessage("write", filePath, error), error));
	}
};
