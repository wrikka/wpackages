import { ChangeType, type LcsChange } from "../types";
import { isEqual } from "../utils/isEqual";

export type { ChangeType, LcsChange };

export function lcs(a: unknown[], b: unknown[]): LcsChange[] {
	const m = a.length;
	const n = b.length;
	const dp: number[][] = Array.from({ length: m + 1 }, () => Array.from({ length: n + 1 }, () => 0));

	for (let i = 1; i <= m; i++) {
		const prevRow = dp[i - 1]!;
		const currentRow = dp[i]!;
		for (let j = 1; j <= n; j++) {
			if (isEqual(a[i - 1], b[j - 1])) {
				const prevVal = prevRow[j - 1];
				if (prevVal !== undefined) {
					dp[i]![j] = prevVal + 1;
				}
			} else {
				const prevCol = prevRow[j];
				const currPrev = currentRow[j - 1];
				dp[i]![j] = Math.max(prevCol ?? 0, currPrev ?? 0);
			}
		}
	}

	let i = m;
	let j = n;
	const result: LcsChange[] = [];

	while (i > 0 || j > 0) {
		if (i > 0 && j > 0 && isEqual(a[i - 1], b[j - 1])) {
			result.unshift({ type: ChangeType.COMMON, value: a[i - 1], indexA: i - 1, indexB: j - 1 });
			i--;
			j--;
		} else if (j > 0 && (i === 0 || (dp[i]?.[j - 1] ?? 0) >= (dp[i - 1]?.[j] ?? 0))) {
			result.unshift({ type: ChangeType.ADD, value: b[j - 1], indexB: j - 1 });
			j--;
		} else if (i > 0 && (j === 0 || (dp[i]?.[j - 1] ?? 0) < (dp[i - 1]?.[j] ?? 0))) {
			result.unshift({ type: ChangeType.DELETE, value: a[i - 1], indexA: i - 1 });
			i--;
		}
	}

	return result;
}
