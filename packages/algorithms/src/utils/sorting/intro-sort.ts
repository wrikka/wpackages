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

function heapify<T>(arr: T[], n: number, i: number): void {
	let largest = i;
	const left = 2 * i + 1;
	const right = 2 * i + 2;

	if (left < n && arr[left]! > arr[largest]!) {
		largest = left;
	}

	if (right < n && arr[right]! > arr[largest]!) {
		largest = right;
	}

	if (largest !== i) {
		[arr[i]!, arr[largest]!] = [arr[largest]!, arr[i]!];
		heapify(arr, n, largest);
	}
}

function heapSort<T>(arr: T[], left: number, right: number): void {
	const n = right - left + 1;
	const subArr = arr.slice(left, right + 1);

	for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
		heapify(subArr, n, i);
	}

	for (let i = n - 1; i > 0; i--) {
		[subArr[0]!, subArr[i]!] = [subArr[i]!, subArr[0]!];
		heapify(subArr, i, 0);
	}

	for (let i = 0; i < n; i++) {
		arr[left + i] = subArr[i]!;
	}
}

export function introSort<T>(arr: T[]): T[] {
	const result = [...arr];
	const maxDepth = 2 * Math.floor(Math.log2(result.length));

	function quickSort(left: number, right: number, depth: number): void {
		if (left >= right) return;

		if (right - left <= 16) {
			insertionSort(result, left, right);
			return;
		}

		if (depth >= maxDepth) {
			heapSort(result, left, right);
			return;
		}

		const pivot = result[right]!;
		let i = left - 1;

		for (let j = left; j < right; j++) {
			if (result[j]! <= pivot) {
				i++;
				[result[i]!, result[j]!] = [result[j]!, result[i]!];
			}
		}

		[result[i + 1]!, result[right]!] = [result[right]!, result[i + 1]!];
		const partitionIndex = i + 1;

		quickSort(left, partitionIndex - 1, depth + 1);
		quickSort(partitionIndex + 1, right, depth + 1);
	}

	quickSort(0, result.length - 1, 0);
	return result;
}
