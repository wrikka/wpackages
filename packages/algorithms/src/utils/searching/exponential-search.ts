function binarySearchInRange<T extends number | string>(
	arr: T[],
	target: T,
	left: number,
	right: number,
): number {
	while (left <= right) {
		const mid = Math.floor(left + (right - left) / 2);
		const midValue = arr[mid];

		if (midValue === undefined) {
			break;
		}

		if (midValue === target) {
			return mid;
		}

		if (midValue < target) {
			left = mid + 1;
		} else {
			right = mid - 1;
		}
	}
	return -1;
}

export function exponentialSearch<T extends number | string>(
	arr: T[],
	target: T,
): number {
	const n = arr.length;
	if (n === 0) {
		return -1;
	}

	const firstEl = arr[0];
	if (firstEl === target) {
		return 0;
	}

	let i = 1;
	while (i < n && (arr[i] ?? Infinity) <= target) {
		i = i * 2;
	}

	return binarySearchInRange(arr, target, i / 2, Math.min(i, n - 1));
}
