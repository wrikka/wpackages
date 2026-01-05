import type { SnapshotService } from "../services/snapshot";

interface TestContext {
	snapshotService: SnapshotService | null;
	currentTestName: string | null;
	updateSnapshots: boolean;
}

const context: TestContext = {
	snapshotService: null,
	currentTestName: null,
	updateSnapshots: false,
};

export const getTestContext = () => context;
export const setTestContext = (newContext: Partial<TestContext>) => {
	Object.assign(context, newContext);
};
