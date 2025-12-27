import type { ReleaseType } from "../types/index";

/**
 * Simple semver utility - no external dependencies
 */

export type Version = {
	major: number;
	minor: number;
	patch: number;
	prerelease?: string[] | undefined;
};

export const parseVersion = (version: string): Version => {
	const clean = version.replace(/^v/, "");
	const [base, prerelease] = clean.split("-") as [string, string | undefined];
	const parts = base ? base.split(".") : [];
	const major = Number(parts[0]);
	const minor = Number(parts[1]);
	const patch = Number(parts[2]);

	return {
		major: Number.isNaN(major) ? 0 : major,
		minor: Number.isNaN(minor) ? 0 : minor,
		patch: Number.isNaN(patch) ? 0 : patch,
		prerelease: prerelease ? prerelease.split(".") : undefined,
	};
};

export const formatVersion = (version: Version): string => {
	let result = `${version.major}.${version.minor}.${version.patch}`;
	if (version.prerelease && version.prerelease.length > 0) {
		result += `-${version.prerelease.join(".")}`;
	}
	return result;
};

export const incrementVersion = (
	current: string,
	type: ReleaseType,
	preid = "beta",
): string => {
	const version = parseVersion(current);

	switch (type) {
		case "major":
			version.major++;
			version.minor = 0;
			version.patch = 0;
			version.prerelease = undefined;
			break;

		case "minor":
			version.minor++;
			version.patch = 0;
			version.prerelease = undefined;
			break;

		case "patch":
			version.patch++;
			version.prerelease = undefined;
			break;

		case "premajor":
			version.major++;
			version.minor = 0;
			version.patch = 0;
			version.prerelease = [preid, "0"];
			break;

		case "preminor":
			version.minor++;
			version.patch = 0;
			version.prerelease = [preid, "0"];
			break;

		case "prepatch":
			version.patch++;
			version.prerelease = [preid, "0"];
			break;

		case "prerelease":
			if (version.prerelease && version.prerelease.length > 0) {
				// Increment existing prerelease
				const lastIndex = version.prerelease.length - 1;
				const last = version.prerelease[lastIndex];
				if (last !== undefined) {
					const num = Number.parseInt(last, 10);
					if (!Number.isNaN(num)) {
						version.prerelease[lastIndex] = String(num + 1);
					} else {
						version.prerelease.push("0");
					}
				}
			} else {
				// Create new prerelease
				version.patch++;
				version.prerelease = [preid, "0"];
			}
			break;
	}

	return formatVersion(version);
};

export const compareVersions = (a: string, b: string): number => {
	const vA = parseVersion(a);
	const vB = parseVersion(b);

	if (vA.major !== vB.major) return vA.major - vB.major;
	if (vA.minor !== vB.minor) return vA.minor - vB.minor;
	if (vA.patch !== vB.patch) return vA.patch - vB.patch;

	// Handle prerelease
	if (!vA.prerelease && !vB.prerelease) return 0;
	if (!vA.prerelease) return 1; // Release > prerelease
	if (!vB.prerelease) return -1; // Prerelease < release

	// Compare prerelease parts
	const minLength = Math.min(vA.prerelease.length, vB.prerelease.length);
	for (let i = 0; i < minLength; i++) {
		const partA = vA.prerelease[i];
		const partB = vB.prerelease[i];

		if (partA !== undefined && partB !== undefined) {
			const numA = Number.parseInt(partA, 10);
			const numB = Number.parseInt(partB, 10);

			if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
				if (numA !== numB) return numA - numB;
			} else {
				if (partA !== partB) return partA.localeCompare(partB);
			}
		}
	}

	return vA.prerelease.length - vB.prerelease.length;
};

export const isValidVersion = (version: string): boolean => {
	try {
		if (!version || version.trim().length === 0) {
			return false;
		}

		// Check basic format: must contain at least one number
		const clean = version.replace(/^v/, "");
		const [base] = clean.split("-");
		const parts = base ? base.split(".") : [];

		// Must have at least major version as valid number
		if (parts.length === 0 || Number.isNaN(Number(parts[0]))) {
			return false;
		}

		// Check that all defined parts are valid numbers
		for (let i = 0; i < parts.length && i < 3; i++) {
			if (parts[i] !== undefined && Number.isNaN(Number(parts[i]))) {
				return false;
			}
		}

		const v = parseVersion(version);
		return (
			typeof v.major === "number"
			&& typeof v.minor === "number"
			&& typeof v.patch === "number"
			&& !Number.isNaN(v.major)
			&& !Number.isNaN(v.minor)
			&& !Number.isNaN(v.patch)
			&& v.major >= 0
			&& v.minor >= 0
			&& v.patch >= 0
		);
	} catch {
		return false;
	}
};
