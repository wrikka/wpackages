export function insertionSort<T extends number | string>(arr: T[]): T[] {
	const n = arr.length;
	if (n <= 1) {
		return arr;
	}

	const array = [...arr]; // Create a shallow copy

	for (let i = 1; i < n; i++) {
		const key = array[i];
		let j = i - 1;

		if (key === undefined) continue;

		while (j >= 0) {
			const current = array[j];
			if (current === undefined || current <= key) {
				break;
			}
			array[j + 1] = current;
			j = j - 1;
		}
		array[j + 1] = key;
	}

	return array;
}
