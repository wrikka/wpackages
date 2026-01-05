import { isEqual } from "./isEqual";

export enum ChangeType {
	ADD,
	DELETE,
	COMMON,
}

export interface LcsChange {
	type: ChangeType;
	value: any;
	indexA?: number;
	indexB?: number;
}

export function lcs(a: any[], b: any[]): LcsChange[] {
	const m = a.length;
	const n = b.length;
	const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
							if (isEqual(a[i - 1], b[j - 1])) {
				dp[i][j] = dp[i - 1][j - 1] + 1;
			} else {
				dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
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
		} else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
			result.unshift({ type: ChangeType.ADD, value: b[j - 1], indexB: j - 1 });
			j--;
		} else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
			result.unshift({ type: ChangeType.DELETE, value: a[i - 1], indexA: i - 1 });
			i--;
		}
	}

	return result;
}
