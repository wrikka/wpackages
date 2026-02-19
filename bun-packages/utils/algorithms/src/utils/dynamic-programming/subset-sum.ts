export function subsetSum(nums: number[], target: number): boolean {
	const n = nums.length;
	const dp: boolean[][] = Array.from({ length: n + 1 }, () => Array(target + 1).fill(false));

	for (let i = 0; i <= n; i++) {
		dp[i]![0] = true;
	}

	for (let i = 1; i <= n; i++) {
		for (let j = 1; j <= target; j++) {
			if (nums[i - 1]! > j) {
				dp[i]![j]! = dp[i - 1]![j]!;
			} else {
				dp[i]![j]! = dp[i - 1]![j]! || dp[i - 1]![j - nums[i - 1]!]!;
			}
		}
	}

	return dp[n]![target]!;
}
