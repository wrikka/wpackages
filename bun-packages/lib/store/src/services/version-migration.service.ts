/**
 * State versioning and migration for @wpackages/store
 * Track state versions and migrate old state to new schema
 */

import type { Store, Listener } from "../types";

export interface VersionedState<T> {
	version: number;
	state: T;
	migratedAt?: number;
}

export interface Migration<TFrom, TTo> {
	version: number;
	migrate: (state: TFrom) => TTo;
}

export interface MigrationHistory {
	fromVersion: number;
	toVersion: number;
	timestamp: number;
}

/**
 * Creates a migration
 * @param version The target version
 * @param migrate The migration function
 * @returns A migration
 */
export function createMigration<TFrom, TTo>(
	version: number,
	migrate: (state: TFrom) => TTo,
): Migration<TFrom, TTo> {
	return { version, migrate };
}

/**
 * Creates a version middleware
 * @param currentVersion The current version
 * @returns Middleware function
 */
export function versionMiddleware<T>(currentVersion: number) {
	return (context: { getState: () => VersionedState<T>; setState: (value: VersionedState<T>) => void }) => {
		const originalSet = context.setState;

		return {
			...context,
			setState: (value: VersionedState<T>) => {
				originalSet({
					...value,
					version: currentVersion,
				});
			},
		};
	};
}

/**
 * Creates a migration middleware
 * @param migrations Array of migrations
 * @returns Middleware function
 */
export function migrationMiddleware<T>(migrations: Migration<unknown, T>[]) {
	return (context: { getState: () => VersionedState<unknown>; setState: (value: VersionedState<T>) => void }) => {
		const originalSet = context.setState;

		return {
			...context,
			setState: (value: VersionedState<T>) => {
				let state = value.state as unknown;
				let fromVersion = value.version;

				for (const migration of migrations) {
					if (fromVersion < migration.version) {
						state = migration.migrate(state);
						fromVersion = migration.version;
					}
				}

				originalSet({
					version: fromVersion,
					state: state as T,
					migratedAt: Date.now(),
				});
			},
		};
	};
}

/**
 * Creates a rollback middleware
 * @param historySize Maximum history size
 * @returns Middleware function
 */
export function rollbackMiddleware<T>(historySize = 10) {
	const history: VersionedState<T>[] = [];

	return (context: { getState: () => VersionedState<T>; setState: (value: VersionedState<T>) => void }) => {
		const originalSet = context.setState;

		return {
			...context,
			setState: (value: VersionedState<T>) => {
				history.push({ ...value });

				if (history.length > historySize) {
					history.shift();
				}

				originalSet(value);
			},
			rollback: (steps = 1) => {
				if (history.length > steps) {
					const previous = history[history.length - 1 - steps];
					if (previous) {
						originalSet(previous);
					}
				}
			},
			getHistory: () => [...history],
		};
	};
}

/**
 * Creates a migration manager
 * @returns A migration manager
 */
export function createMigrationManager<T>() {
	const migrations: Migration<unknown, T>[] = [];
	const history: MigrationHistory[] = [];

	return {
		addMigration(migration: Migration<unknown, T>): void {
			migrations.push(migration);
		},

		getMigrations(): Migration<unknown, T>[] {
			return [...migrations];
		},

		migrate(state: VersionedState<unknown>): VersionedState<T> {
			let result = state.state as unknown;
			let fromVersion = state.version;

			for (const migration of migrations) {
				if (fromVersion < migration.version) {
					result = migration.migrate(result);
					fromVersion = migration.version;

					history.push({
						fromVersion: state.version,
						toVersion: migration.version,
						timestamp: Date.now(),
					});
				}
			}

			return {
				version: fromVersion,
				state: result as T,
				migratedAt: Date.now(),
			};
		},

		getHistory(): MigrationHistory[] {
			return [...history];
		},

		clearHistory(): void {
			history.length = 0;
		},
	};
}

/**
 * Creates a versioned store
 * @param store The store to enhance
 * @param version The current version
 * @returns A versioned store
 */
export function withVersioning<T>(
	store: Store<T>,
	version: number,
): Store<VersionedState<T>> {
	const versionedStore: Store<VersionedState<T>> = {
		get: () => {
			return {
				version,
				state: store.get(),
			};
		},
		set: (value: VersionedState<T>) => {
			store.set(value.state);
		},
		subscribe: (listener: Listener<VersionedState<T>>) => {
			return store.subscribe((state, oldValue) => {
				listener(
					{
						version,
						state,
					},
					oldValue ? { version, state: oldValue } : undefined,
				);
			});
		},
	};

	return versionedStore;
}

/**
 * Creates a migratable store
 * @param store The store to enhance
 * @param migrations Array of migrations
 * @returns A migratable store
 */
export function withMigration<T>(
	store: Store<T>,
	migrations: Migration<unknown, T>[],
): Store<T> {
	const manager = createMigrationManager<T>();

	for (const migration of migrations) {
		manager.addMigration(migration);
	}

	const migratableStore: Store<T> = {
		get: () => {
			return store.get();
		},
		set: (value: T) => {
			const versioned = {
				version: 0,
				state: value as unknown,
			} as VersionedState<unknown>;
			const migrated = manager.migrate(versioned);
			store.set(migrated.state);
		},
		subscribe: store.subscribe.bind(store),
	};

	return migratableStore;
}
