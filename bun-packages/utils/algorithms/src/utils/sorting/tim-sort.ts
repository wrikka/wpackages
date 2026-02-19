function insertionSort<T>(arr: T[], left: number, right: number): void {
	for (let i = left + 1; i <= right; i++) {
		const key = arr[i]!;
		let j = i - 1;

		while (j >= left && arr[j]! > key) {
			arr[j + 1] = arr[j]!;
			j--;
		}

		arr[j + 1] = key;
	}
}

function merge<T>(arr: T[], l: number, m: number, r: number): void {
	const left = arr.slice(l, m + 1);
	const right = arr.slice(m + 1, r + 1);

	let i = 0;
	let j = 0;
	let k = l;

	while (i < left.length && j < right.length) {
		if (left[i]! <= right[j]!) {
			arr[k++] = left[i++]!;
		} else {
			arr[k++] = right[j++]!;
		}
	}

	while (i < left.length) {
		arr[k++] = left[i++]!;
	}

	while (j < right.length) {
		arr[k++] = right[j++]!;
	}
}

function timSortHelper<T>(arr: T[], n: number): void {
	const minRun = 32;

	for (let i = 0; i < n; i += minRun) {
		insertionSort(arr, i, Math.min(i + minRun - 1, n - 1));
	}

	for (let size = minRun; size < n; size *= 2) {
		for (let left = 0; left < n; left += 2 * size) {
			const mid = left + size - 1;
			const right = Math.min(left + 2 * size - 1, n - 1);

			if (mid < right) {
				merge(arr, left, mid, right);
			}
		}
	}
}

export function timSort<T>(arr: T[]): T[] {
	const result = [...arr];
	timSortHelper(result, result.length);
	return result;
}
