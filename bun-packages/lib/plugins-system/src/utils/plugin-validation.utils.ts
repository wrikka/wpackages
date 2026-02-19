import type { Plugin, PluginMetadata } from "../types";

export const validatePluginMetadata = (
	metadata: PluginMetadata,
): readonly string[] => {
	const errors: string[] = [];

	if (!metadata.id || metadata.id.trim() === "") {
		errors.push("Plugin id is required");
	}

	if (!metadata.name || metadata.name.trim() === "") {
		errors.push("Plugin name is required");
	}

	if (!metadata.version || metadata.version.trim() === "") {
		errors.push("Plugin version is required");
	}

	if (!/^\d+\.\d+\.\d+/.test(metadata.version)) {
		errors.push("Plugin version must follow semver format (e.g., 1.0.0)");
	}

	if (!metadata.author || metadata.author.trim() === "") {
		errors.push("Plugin author is required");
	}

	return Object.freeze(errors);
};

export const validatePlugin = (plugin: Plugin): readonly string[] => {
	const errors: string[] = [];

	const metadataErrors = validatePluginMetadata(plugin.metadata);
	errors.push(...metadataErrors);

	if (typeof plugin.init !== "function") {
		errors.push("Plugin init must be a function");
	}

	if (plugin.dependencies) {
		for (const dep of plugin.dependencies) {
			if (!dep.id || dep.id.trim() === "") {
				errors.push("Dependency id is required");
			}
			if (!dep.version || dep.version.trim() === "") {
				errors.push(`Dependency ${dep.id} version is required`);
			}
		}
	}

	return Object.freeze(errors);
};

export const isPluginCompatible = (
	requiredVersion: string,
	actualVersion: string,
): boolean => {
	const parseVersion = (v: string): number[] => {
		return v.split(".").map((n) => Number.parseInt(n, 10));
	};

	const required = parseVersion(requiredVersion);
	const actual = parseVersion(actualVersion);

	if (required[0] !== actual[0]) return false;

	const reqMinor = required[1] ?? 0;
	const actMinor = actual[1] ?? 0;
	if (reqMinor > actMinor) return false;

	const reqPatch = required[2] ?? 0;
	const actPatch = actual[2] ?? 0;
	if (reqMinor === actMinor && reqPatch > actPatch) return false;

	return true;
};
