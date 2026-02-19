import { dirname, join, relative } from "node:path";

export function getSnapshotPath(params: {
	testFile: string;
	snapshotDir: string;
}): string {
	const testDir = dirname(params.testFile);
	const snapshotSubDir = join(testDir, params.snapshotDir);
	const testFileName = relative(testDir, params.testFile);
	const snapshotFileName = testFileName.replace(/\.(test|spec)\.[^.]+$/, ".snap");
	return join(snapshotSubDir, snapshotFileName);
}
