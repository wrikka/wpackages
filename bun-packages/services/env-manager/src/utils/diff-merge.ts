export type DiffResult = {
	key: string;
	status: "added" | "removed" | "changed" | "unchanged";
	oldValue?: string;
	newValue?: string;
};

export type MergeOptions = {
	strategy?: "ours" | "theirs" | "manual";
	conflictResolution?: Record<string, "ours" | "theirs">;
};

export const diffEnv = (
	oldEnv: Record<string, string>,
	newEnv: Record<string, string>,
): DiffResult[] => {
	const allKeys = new Set([...Object.keys(oldEnv), ...Object.keys(newEnv)]);
	const results: DiffResult[] = [];

	for (const key of allKeys) {
		const oldValue = oldEnv[key];
		const newValue = newEnv[key];

		if (oldValue === undefined) {
			results.push({ key, status: "added", newValue });
		} else if (newValue === undefined) {
			results.push({ key, status: "removed", oldValue });
		} else if (oldValue !== newValue) {
			results.push({ key, status: "changed", oldValue, newValue });
		} else {
			results.push({ key, status: "unchanged", oldValue: newValue });
		}
	}

	return results.sort((a, b) => a.key.localeCompare(b.key));
};

export const formatDiff = (diff: DiffResult[]): string => {
	const lines: string[] = [];

	for (const item of diff) {
		switch (item.status) {
			case "added":
				lines.push(`+ ${item.key}=${item.newValue}`);
				break;
			case "removed":
				lines.push(`- ${item.key}=${item.oldValue}`);
				break;
			case "changed":
				lines.push(`~ ${item.key}`);
				lines.push(`  - ${item.oldValue}`);
				lines.push(`  + ${item.newValue}`);
				break;
			case "unchanged":
				lines.push(`  ${item.key}=${item.oldValue}`);
				break;
		}
	}

	return lines.join("\n");
};

export const mergeEnv = (
	base: Record<string, string>,
	theirs: Record<string, string>,
	ours: Record<string, string>,
	options: MergeOptions = {},
): { merged: Record<string, string>; conflicts: string[] } => {
	const { strategy = "manual", conflictResolution = {} } = options;
	const merged: Record<string, string> = { ...base };
	const conflicts: string[] = [];
	const allKeys = new Set([...Object.keys(base), ...Object.keys(theirs), ...Object.keys(ours)]);

	for (const key of allKeys) {
		const baseValue = base[key];
		const theirsValue = theirs[key];
		const oursValue = ours[key];

		if (theirsValue === undefined && oursValue === undefined) {
			continue;
		}

		if (theirsValue === undefined) {
			merged[key] = oursValue!;
			continue;
		}

		if (oursValue === undefined) {
			merged[key] = theirsValue;
			continue;
		}

		if (theirsValue === oursValue) {
			merged[key] = theirsValue;
			continue;
		}

		if (baseValue === theirsValue) {
			merged[key] = oursValue;
			continue;
		}

		if (baseValue === oursValue) {
			merged[key] = theirsValue;
			continue;
		}

		if (strategy === "ours") {
			merged[key] = oursValue;
		} else if (strategy === "theirs") {
			merged[key] = theirsValue;
		} else {
			const resolution = conflictResolution[key];
			if (resolution === "ours") {
				merged[key] = oursValue;
			} else if (resolution === "theirs") {
				merged[key] = theirsValue;
			} else {
				conflicts.push(key);
			}
		}
	}

	return { merged, conflicts };
};

export const applyDiff = (
	base: Record<string, string>,
	diff: DiffResult[],
): Record<string, string> => {
	const result: Record<string, string> = { ...base };

	for (const item of diff) {
		switch (item.status) {
			case "added":
				if (item.newValue !== undefined) {
					result[item.key] = item.newValue;
				}
				break;
			case "removed":
				delete result[item.key];
				break;
			case "changed":
				if (item.newValue !== undefined) {
					result[item.key] = item.newValue;
				}
				break;
		}
	}

	return result;
};
