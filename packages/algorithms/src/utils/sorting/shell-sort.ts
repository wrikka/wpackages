export function shellSort<T>(arr: T[]): T[] {
	const result = [...arr];
	const n = result.length;

	for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
		for (let i = gap; i < n; i++) {
			const temp = result[i]!;
			let j = i;

			while (j >= gap && result[j - gap]! > temp) {
				result[j] = result[j - gap]!;
				j -= gap;
			}

			result[j] = temp;
		}
	}

	return result;
}
