/**
 * Snapshot testing utilities
 */

import type { SnapshotOptions } from "../types";

/**
 * Snapshot storage
 */
const snapshots = new Map<string, unknown>();

/**
 * Create snapshot key
 */
const createSnapshotKey = (name: string, index: number): string => {
	return `${name}:${index}`;
};

/**
 * Get snapshot count for a given name
 */
const getSnapshotCount = (name: string): number => {
	return Array.from(snapshots.keys()).filter((k) => k.startsWith(`${name}:`))
		.length;
};

/**
 * Store snapshot
 */
export const storeSnapshot = (name: string, value: unknown): void => {
	const index = getSnapshotCount(name);
	const key = createSnapshotKey(name, index);
	snapshots.set(key, value);
};

/**
 * Get snapshot
 */
export const getSnapshot = (name: string, index: number): unknown => {
	const key = createSnapshotKey(name, index);
	return snapshots.get(key);
};

/**
 * Compare with snapshot
 */
export const matchSnapshot = (
	value: unknown,
	options?: SnapshotOptions,
): boolean => {
	const name = options?.name || "snapshot";
	const index = getSnapshotCount(name);

	const snapshot = getSnapshot(name, index);

	if (snapshot === undefined) {
		if (options?.update) {
			storeSnapshot(name, value);
			return true;
		}
		return false;
	}

	return JSON.stringify(value) === JSON.stringify(snapshot);
};

/**
 * Clear all snapshots
 */
export const clearSnapshots = (): void => {
	snapshots.clear();
};

/**
 * Get all snapshots
 */
export const getAllSnapshots = (): Map<string, unknown> => {
	return new Map(snapshots);
};
