import { ChangeType, type DiffResult } from "../types";
import { lcs } from "./lcs";

export function diffArrays(expected: unknown[], actual: unknown[]): DiffResult | undefined {
	const changes = lcs(expected, actual);

	if (changes.every(c => c.type === ChangeType.COMMON)) {
		return undefined;
	}

	const result: DiffResult = { added: {}, deleted: {}, updated: { _lcs: changes } };
	return result;
}
