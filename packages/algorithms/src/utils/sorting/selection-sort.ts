export function selectionSort<T extends number | string>(arr: T[]): T[] {
	const n = arr.length;
	if (n <= 1) {
		return arr;
	}

	const array = [...arr]; // Create a shallow copy

	for (let i = 0; i < n - 1; i++) {
		let minIndex = i;

		for (let j = i + 1; j < n; j++) {
			const current = array[j];
			const min = array[minIndex];

			if (current !== undefined && min !== undefined && current < min) {
				minIndex = j;
			}
		}

		if (minIndex !== i) {
			const minAtIndex = array[minIndex];
			const atI = array[i];
			if (minAtIndex !== undefined && atI !== undefined) {
				[array[i], array[minIndex]] = [minAtIndex, atI]; // Swap
			}
		}
	}

	return array;
}
