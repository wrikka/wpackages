export interface Snapshot<out S> {
	readonly aggregateId: string;
	readonly version: number;
	readonly state: S;
	readonly timestamp: number;
}

export interface SnapshotStore<out S> {
	save(snapshot: Snapshot<S>): Promise<void>;
	load(aggregateId: string): Promise<Snapshot<S> | null>;
}

export class InMemorySnapshotStore<S> implements SnapshotStore<S> {
	private snapshots = new Map<string, Snapshot<S>>();

	async save(snapshot: Snapshot<S>): Promise<void> {
		this.snapshots.set(snapshot.aggregateId, snapshot);
	}

	async load(aggregateId: string): Promise<Snapshot<S> | null> {
		return this.snapshots.get(aggregateId) || null;
	}
}

export const createSnapshotStore = <S>(): SnapshotStore<S> => {
	return new InMemorySnapshotStore<S>();
};
