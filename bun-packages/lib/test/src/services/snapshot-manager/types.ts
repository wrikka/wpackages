export interface SnapshotOptions {
	updateSnapshots?: boolean;
	snapshotDir?: string;
	inlineSnapshots?: boolean;
}

export interface SnapshotData {
	value: any;
	inline?: boolean;
}
