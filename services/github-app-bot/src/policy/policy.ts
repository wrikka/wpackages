import { readFileSync } from "node:fs";

export interface Policy {
	readonly engines?: Record<string, string>;
	readonly blockedPackages?: readonly string[];
	readonly allowedPackagePatterns?: readonly string[];
	readonly lockfiles?: readonly string[];
	readonly maxNewDependencies?: number;
}

export const readPolicy = (path: string): Policy => {
	const raw = readFileSync(path, "utf8");
	return JSON.parse(raw) as Policy;
};

export const defaultPolicyPath = new URL("../../policy.json", import.meta.url);
