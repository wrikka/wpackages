import { diff } from "@wpackages/diff";
import { AssertionError } from "../../error";
import { getTestContext } from "../../services/context.service";

export function toMatchSnapshot(received: any, hint?: string) {
	const { snapshotService, currentTestName, updateSnapshots } = getTestContext();

	if (!snapshotService || !currentTestName) {
		throw new AssertionError("Snapshot assertions can only be used within a test.");
	}

	const key = hint ? `${currentTestName} ${hint}` : currentTestName;
	const expected = snapshotService.get(key);
	const actual = JSON.stringify(received, null, 2);

	if (expected === undefined || updateSnapshots) {
		snapshotService.set(key, actual);
		return;
	}

	if (actual !== expected) {
		const difference = diff(expected, actual);
		const differenceText = difference ? JSON.stringify(difference, null, 2) : "";
		throw new AssertionError(
			`Snapshot does not match.\n${differenceText}`,
			expected,
			actual,
		);
	}
}
