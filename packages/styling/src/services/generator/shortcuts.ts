export function expandShortcuts(classes: ReadonlySet<string>, shortcuts: Record<string, string>): Set<string> {
	const expanded = new Set<string>();

	function expandOne(cls: string, seen: Set<string>): void {
		if (seen.has(cls)) {
			console.warn(`[styling] Circular shortcut detected: ${cls}`);
			return;
		}

		const value = shortcuts[cls];
		if (!value) {
			expanded.add(cls);
			return;
		}

		seen.add(cls);
		for (const part of value.split(/\s+/).filter(Boolean)) {
			expandOne(part, seen);
		}
		seen.delete(cls);
	}

	for (const cls of classes) {
		expandOne(cls, new Set());
	}

	return expanded;
}
