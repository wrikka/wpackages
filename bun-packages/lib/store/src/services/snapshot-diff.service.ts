/**
 * State snapshot and diff for @wpackages/store
 * Capture state snapshots and compute diffs
 */

export interface StateSnapshot<T> {
	state: T;
	timestamp: number;
	id: string;
}

export interface DiffOperation {
	type: "add" | "remove" | "replace" | "move";
	path: string;
	value?: unknown;
	oldValue?: unknown;
}

export interface StateDiff {
	operations: DiffOperation[];
	timestamp: number;
}

/**
 * Creates a state snapshot
 * @param state The state to snapshot
 * @returns A state snapshot
 */
export function createSnapshot<T>(state: T): StateSnapshot<T> {
	return {
		state: JSON.parse(JSON.stringify(state)) as T,
		timestamp: Date.now(),
		id: Math.random().toString(36).substring(2, 9),
	};
}

/**
 * Creates a diff between two states
 * @param oldState The old state
 * @param newState The new state
 * @returns A state diff
 */
export function createDiff<T>(oldState: T, newState: T): StateDiff {
	const operations: DiffOperation[] = [];
	const timestamp = Date.now();

	function diffValues(oldValue: unknown, newValue: unknown, path: string): void {
		if (oldValue === newValue) {
			return;
		}

		if (typeof oldValue !== "object" || oldValue === null || typeof newValue !== "object" || newValue === null) {
			operations.push({
				type: "replace",
				path,
				value: newValue,
				oldValue,
			});
			return;
		}

		const oldKeys = Object.keys(oldValue as Record<string, unknown>);
		const newKeys = Object.keys(newValue as Record<string, unknown>);

		for (const key of newKeys) {
			if (!Object.prototype.hasOwnProperty.call(oldValue, key)) {
				operations.push({
					type: "add",
					path: `${path}.${key}`,
					value: (newValue as Record<string, unknown>)[key],
				});
			}
		}

		for (const key of oldKeys) {
			if (!Object.prototype.hasOwnProperty.call(newValue, key)) {
				operations.push({
					type: "remove",
					path: `${path}.${key}`,
					oldValue: (oldValue as Record<string, unknown>)[key],
				});
			}
		}

		for (const key of newKeys) {
			if (Object.prototype.hasOwnProperty.call(oldValue, key)) {
				diffValues(
					(oldValue as Record<string, unknown>)[key],
					(newValue as Record<string, unknown>)[key],
					`${path}.${key}`,
				);
			}
		}
	}

	diffValues(oldState, newState, "");

	return { operations, timestamp };
}

/**
 * Applies a patch to a state
 * @param state The state to patch
 * @param operations The diff operations to apply
 * @returns The patched state
 */
export function applyPatch<T>(state: T, operations: DiffOperation[]): T {
	let result = JSON.parse(JSON.stringify(state)) as T;

	for (const operation of operations) {
		const pathParts = operation.path.split(".").filter(Boolean);
		let current = result as Record<string, unknown>;

		for (let i = 0; i < pathParts.length - 1; i++) {
			const part = pathParts[i];
			if (!(part in current)) {
				current[part] = {};
			}
			current = current[part] as Record<string, unknown>;
		}

		const lastPart = pathParts[pathParts.length - 1];

		switch (operation.type) {
			case "add":
			case "replace":
				current[lastPart] = operation.value;
				break;
			case "remove":
				delete current[lastPart];
				break;
			case "move":
				current[lastPart] = operation.value;
				break;
		}
	}

	return result;
}

/**
 * Applies a diff to a state
 * @param state The state to apply diff to
 * @param diff The diff to apply
 * @returns The updated state
 */
export function applyDiff<T>(state: T, diff: StateDiff): T {
	return applyPatch(state, diff.operations);
}

/**
 * Reverses a diff
 * @param diff The diff to reverse
 * @returns The reversed diff
 */
export function reverseDiff(diff: StateDiff): StateDiff {
	const reversedOperations: DiffOperation[] = [];

	for (const operation of diff.operations) {
		switch (operation.type) {
			case "add":
				reversedOperations.push({
					type: "remove",
					path: operation.path,
					oldValue: operation.value,
				});
				break;
			case "remove":
				reversedOperations.push({
					type: "add",
					path: operation.path,
					value: operation.oldValue,
				});
				break;
			case "replace":
				reversedOperations.push({
					type: "replace",
					path: operation.path,
					value: operation.oldValue,
					oldValue: operation.value,
				});
				break;
			case "move":
				reversedOperations.push({
					type: "move",
					path: operation.path,
					value: operation.oldValue,
					oldValue: operation.value,
				});
				break;
		}
	}

	return {
		operations: reversedOperations.reverse(),
		timestamp: Date.now(),
	};
}

/**
 * Merges multiple diffs
 * @param diffs Array of diffs to merge
 * @returns A merged diff
 */
export function mergeDiffs(diffs: StateDiff[]): StateDiff {
	const operations: DiffOperation[] = [];

	for (const diff of diffs) {
		operations.push(...diff.operations);
	}

	return {
		operations,
		timestamp: Date.now(),
	};
}

/**
 * Creates a snapshot manager
 * @returns A snapshot manager
 */
export function createSnapshotManager<T>() {
	const snapshots: StateSnapshot<T>[] = [];

	return {
		add(state: T): string {
			const snapshot = createSnapshot(state);
			snapshots.push(snapshot);
			return snapshot.id;
		},

		get(id: string): StateSnapshot<T> | undefined {
			return snapshots.find((s) => s.id === id);
		},

		getLatest(): StateSnapshot<T> | undefined {
			return snapshots[snapshots.length - 1];
		},

		getAll(): StateSnapshot<T>[] {
			return [...snapshots];
		},

		remove(id: string): void {
			const index = snapshots.findIndex((s) => s.id === id);
			if (index !== -1) {
				snapshots.splice(index, 1);
			}
		},

		clear(): void {
			snapshots.length = 0;
		},

		restore(id: string): T | undefined {
			const snapshot = this.get(id);
			return snapshot?.state;
		},
	};
}

/**
 * Creates a diff manager
 * @returns A diff manager
 */
export function createDiffManager() {
	const diffs: StateDiff[] = [];

	return {
		add(diff: StateDiff): void {
			diffs.push(diff);
		},

		getAll(): StateDiff[] {
			return [...diffs];
		},

		getLatest(): StateDiff | undefined {
			return diffs[diffs.length - 1];
		},

		clear(): void {
			diffs.length = 0;
		},

		undo(state: unknown, count = 1): unknown {
			let result = state;
			const startIndex = Math.max(0, diffs.length - count);
			const reversedDiffs = diffs.slice(startIndex).reverse();

			for (const diff of reversedDiffs) {
				result = applyDiff(result as never, reverseDiff(diff));
			}

			diffs.splice(startIndex, count);
			return result;
		},

		redo(state: unknown, count = 1): unknown {
			let result = state;
			const startIndex = Math.max(0, diffs.length - count);
			const redoDiffs = diffs.slice(startIndex);

			for (const diff of redoDiffs) {
				result = applyDiff(result as never, diff);
			}

			return result;
		},
	};
}
