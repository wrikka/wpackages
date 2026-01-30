export function longestIncreasingSubsequence(arr: number[]): number[] {
	if (arr.length === 0) return [];

	const n = arr.length;
	const dp: number[] = Array(n).fill(1);
	const prev: number[] = Array(n).fill(-1);

	for (let i = 1; i < n; i++) {
		for (let j = 0; j < i; j++) {
			if (arr[j]! < arr[i]! && dp[j]! + 1 > dp[i]!) {
				dp[i]! = dp[j]! + 1;
				prev[i]! = j;
			}
		}
	}

	let maxLength = 0;
	let endIndex = 0;
	for (let i = 0; i < n; i++) {
		if (dp[i]! > maxLength) {
			maxLength = dp[i]!;
			endIndex = i;
		}
	}

	const lis: number[] = [];
	let current = endIndex;
	while (current !== -1) {
		lis.unshift(arr[current]!);
		current = prev[current]!;
	}

	return lis;
}
