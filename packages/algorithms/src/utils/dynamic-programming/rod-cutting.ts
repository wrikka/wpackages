export function rodCutting(prices: number[], n: number): number {
	const dp: number[] = Array(n + 1).fill(0);

	for (let i = 1; i <= n; i++) {
		let maxVal = -Infinity;
		for (let j = 1; j <= i; j++) {
			const price = prices[j - 1] ?? 0;
			maxVal = Math.max(maxVal, price + dp[i - j]!);
		}
		dp[i] = maxVal;
	}

	return dp[n]!;
}
