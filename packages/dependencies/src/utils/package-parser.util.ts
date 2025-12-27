import type { PackageInfo } from "../types/index";

/**
 * Parse package string to PackageInfo
 * Handles both scoped and regular packages with optional versions
 * @param pkg - Package string (e.g., "react@18.0.0", "@types/node@20.0.0")
 * @returns Parsed package information
 * @example
 * parsePackage("react") // { name: "react" }
 * parsePackage("react@18.0.0") // { name: "react", version: "18.0.0" }
 * parsePackage("@types/node") // { name: "@types/node" }
 * parsePackage("@types/node@20.0.0") // { name: "@types/node", version: "20.0.0" }
 */
export function parsePackage(pkg: string): PackageInfo {
	// Handle scoped packages (@scope/name)
	const isScopedPackage = pkg.startsWith("@");

	if (isScopedPackage) {
		// Find the @ after the scope
		const versionIndex = pkg.indexOf("@", 1);

		if (versionIndex === -1) {
			return { name: pkg };
		}

		return {
			name: pkg.slice(0, versionIndex),
			version: pkg.slice(versionIndex + 1),
		};
	}

	// Handle regular packages
	const parts = pkg.split("@");

	if (parts.length === 1) {
		return { name: parts[0] || pkg };
	}

	return {
		name: parts[0] || pkg,
		version: parts.slice(1).join("@"), // In case version has @ (unlikely but handle it)
	};
}

/**
 * Parse multiple packages
 * @param packages - Array of package strings
 * @returns Array of parsed package information
 */
export function parsePackages(packages: readonly string[]): readonly PackageInfo[] {
	return packages.map(parsePackage);
}

/**
 * Format package info to string
 * @param pkg - Package information
 * @returns Formatted package string
 */
export function formatPackage(pkg: PackageInfo): string {
	return pkg.version ? `${pkg.name}@${pkg.version}` : pkg.name;
}

/**
 * Format multiple package infos to strings
 * @param packages - Array of package information
 * @returns Array of formatted package strings
 */
export function formatPackages(packages: readonly PackageInfo[]): readonly string[] {
	return packages.map(formatPackage);
}
