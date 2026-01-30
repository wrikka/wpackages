export function bubbleSort<T extends number | string>(arr: T[]): T[] {
	const n = arr.length;
	if (n <= 1) {
		return arr;
	}

	const array = [...arr]; // Create a shallow copy to avoid modifying the original array

	for (let i = 0; i < n - 1; i++) {
		let swapped = false;
		for (let j = 0; j < n - 1 - i; j++) {
			const current = array[j];
			const next = array[j + 1];

			if (current !== undefined && next !== undefined && current > next) {
				[array[j], array[j + 1]] = [next, current]; // Swap
				swapped = true;
			}
		}
		// If no two elements were swapped by inner loop, then break
		if (!swapped) {
			break;
		}
	}

	return array;
}
