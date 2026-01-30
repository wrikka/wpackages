export function fibonacci(n: number): number[] {
	if (n <= 0) {
		return [];
	}
	if (n === 1) {
		return [0];
	}

	const sequence = [0, 1];
	for (let i = 2; i < n; i++) {
		const prev1 = sequence[i - 1];
		const prev2 = sequence[i - 2];
		if (prev1 !== undefined && prev2 !== undefined) {
			sequence.push(prev1 + prev2);
		}
	}

	return sequence;
}
