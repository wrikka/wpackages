function partition<T extends number | string>(array: T[], low: number, high: number): number {
	const pivot = array[high];
	if (pivot === undefined) return high;

	let i = low - 1;

	for (let j = low; j < high; j++) {
		const current = array[j];
		if (current !== undefined && current < pivot) {
			i++;
			const atI = array[i];
			if (atI !== undefined) {
				[array[i], array[j]] = [current, atI]; // Swap
			}
		}
	}

	const atIPlus1 = array[i + 1];
	if (atIPlus1 !== undefined) {
		[array[i + 1], array[high]] = [pivot, atIPlus1]; // Swap pivot
	}
	return i + 1;
}

function quickSortRecursive<T extends number | string>(
	array: T[],
	low: number,
	high: number,
): void {
	if (low < high) {
		const pi = partition(array, low, high);
		quickSortRecursive(array, low, pi - 1);
		quickSortRecursive(array, pi + 1, high);
	}
}

export function quickSort<T extends number | string>(arr: T[]): T[] {
	if (arr.length <= 1) {
		return [...arr];
	}
	const array = [...arr]; // Create a shallow copy
	quickSortRecursive(array, 0, array.length - 1);
	return array;
}
