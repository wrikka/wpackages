export function matrixChainMultiplication(dims: number[]): number {
	const n = dims.length - 1;
	const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

	for (let len = 2; len <= n; len++) {
		for (let i = 0; i <= n - len; i++) {
			const j = i + len - 1;
			dp[i]![j]! = Infinity;

			for (let k = i; k < j; k++) {
				const cost = dp[i]![k]! + dp[k + 1]![j]! + dims[i]! * dims[k + 1]! * dims[j + 1]!;
				dp[i]![j]! = Math.min(dp[i]![j]!, cost);
			}
		}
	}

	return dp[0]![n - 1]!;
}
