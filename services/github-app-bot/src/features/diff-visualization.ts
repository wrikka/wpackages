export interface DependencyDiff {
	readonly added: Record<string, string>;
	readonly removed: Record<string, string>;
	readonly changed: Record<string, { readonly from: string; readonly to: string }>;
}

export interface DiffVisualizationOptions {
	readonly includeAdded?: boolean;
	readonly includeRemoved?: boolean;
	readonly includeChanged?: boolean;
	readonly maxEntries?: number;
}

export const renderDiffTable = (
	diff: DependencyDiff,
	options: DiffVisualizationOptions = {},
): string => {
	const { includeAdded = true, includeRemoved = true, includeChanged = true, maxEntries = 50 } = options;

	const sections: string[] = [];

	if (includeAdded && Object.keys(diff.added).length > 0) {
		const addedEntries = Object.entries(diff.added).slice(0, maxEntries);
		sections.push("### Added Dependencies");
		sections.push("");
		sections.push("| Package | Version |");
		sections.push("|---------|---------|");
		for (const [pkg, version] of addedEntries) {
			sections.push(`| \`${pkg}\` | ${version} |`);
		}
		if (Object.keys(diff.added).length > maxEntries) {
			sections.push(`| ... | ${Object.keys(diff.added).length - maxEntries} more |`);
		}
		sections.push("");
	}

	if (includeRemoved && Object.keys(diff.removed).length > 0) {
		const removedEntries = Object.entries(diff.removed).slice(0, maxEntries);
		sections.push("### Removed Dependencies");
		sections.push("");
		sections.push("| Package | Previous Version |");
		sections.push("|---------|------------------|");
		for (const [pkg, version] of removedEntries) {
			sections.push(`| \`${pkg}\` | ${version} |`);
		}
		if (Object.keys(diff.removed).length > maxEntries) {
			sections.push(`| ... | ${Object.keys(diff.removed).length - maxEntries} more |`);
		}
		sections.push("");
	}

	if (includeChanged && Object.keys(diff.changed).length > 0) {
		const changedEntries = Object.entries(diff.changed).slice(0, maxEntries);
		sections.push("### Updated Dependencies");
		sections.push("");
		sections.push("| Package | From | To | Change Type |");
		sections.push("|---------|------|-----|-------------|");
		for (const [pkg, { from, to }] of changedEntries) {
			const changeType = getChangeType(from, to);
			const emoji = getChangeEmoji(changeType);
			sections.push(`| \`${pkg}\` | ${from} | ${to} | ${emoji} ${changeType} |`);
		}
		if (Object.keys(diff.changed).length > maxEntries) {
			sections.push(`| ... | ... | ... | ${Object.keys(diff.changed).length - maxEntries} more |`);
		}
		sections.push("");
	}

	if (sections.length === 0) {
		return "No dependency changes detected.";
	}

	return sections.join("\n");
};

export const renderDiffSummary = (diff: DependencyDiff): string => {
	const addedCount = Object.keys(diff.added).length;
	const removedCount = Object.keys(diff.removed).length;
	const changedCount = Object.keys(diff.changed).length;

	const parts: string[] = [];
	if (addedCount > 0) parts.push(`${addedCount} added`);
	if (removedCount > 0) parts.push(`${removedCount} removed`);
	if (changedCount > 0) parts.push(`${changedCount} updated`);

	if (parts.length === 0) return "No dependency changes";

	return parts.join(", ");
};

type ChangeType = "major" | "minor" | "patch" | "prerelease" | "other";

const getChangeType = (from: string, to: string): ChangeType => {
	const fromSemver = parseSemver(from);
	const toSemver = parseSemver(to);

	if (!fromSemver || !toSemver) return "other";

	if (toSemver.major > fromSemver.major) return "major";
	if (toSemver.minor > fromSemver.minor) return "minor";
	if (toSemver.patch > fromSemver.patch) return "patch";
	if (toSemver.prerelease && !fromSemver.prerelease) return "prerelease";

	return "other";
};

const getChangeEmoji = (type: ChangeType): string => {
	switch (type) {
		case "major":
			return "🔴";
		case "minor":
			return "🟡";
		case "patch":
			return "🟢";
		case "prerelease":
			return "🔵";
		default:
			return "⚪";
	}
};

interface Semver {
	readonly major: number;
	readonly minor: number;
	readonly patch: number;
	readonly prerelease?: string;
}

const parseSemver = (version: string): Semver | null => {
	const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?/);
	if (!match) return null;

	return {
		major: Number.parseInt(match[1], 10),
		minor: Number.parseInt(match[2], 10),
		patch: Number.parseInt(match[3], 10),
		prerelease: match[4],
	};
};

export const groupChangesByType = (diff: DependencyDiff): Record<ChangeType, string[]> => {
	const groups: Record<ChangeType, string[]> = {
		major: [],
		minor: [],
		patch: [],
		prerelease: [],
		other: [],
	};

	for (const [pkg, { from, to }] of Object.entries(diff.changed)) {
		const type = getChangeType(from, to);
		groups[type].push(pkg);
	}

	return groups;
};
