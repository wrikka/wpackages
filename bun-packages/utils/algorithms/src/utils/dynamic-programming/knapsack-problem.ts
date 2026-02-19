export function knapsack(
	items: { weight: number; value: number }[],
	capacity: number,
): { maxValue: number; selectedItems: { weight: number; value: number }[] } {
	const n = items.length;
	const dp = Array(n + 1)
		.fill(0)
		.map(() => Array(capacity + 1).fill(0));

	for (let i = 1; i <= n; i++) {
		const currentItem = items[i - 1]!;
		for (let w = 1; w <= capacity; w++) {
			if (currentItem.weight > w) {
				dp[i]![w] = dp[i - 1]![w]!;
			} else {
				dp[i]![w] = Math.max(
					dp[i - 1]![w]!,
					dp[i - 1]![w - currentItem.weight]! + currentItem.value,
				);
			}
		}
	}

	let w = capacity;
	const selectedItems: { weight: number; value: number }[] = [];
	for (let i = n; i > 0 && dp[i]![w]! > 0; i--) {
		if (dp[i]![w] !== dp[i - 1]![w]) {
			const currentItem = items[i - 1]!;
			selectedItems.push(currentItem);
			w -= currentItem.weight;
		}
	}

	return { maxValue: dp[n]![capacity]!, selectedItems };
}
