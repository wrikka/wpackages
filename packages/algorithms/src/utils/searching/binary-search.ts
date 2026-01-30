export function binarySearch<T extends number | string>(
	arr: T[],
	target: T,
): number {
	let left = 0;
	let right = arr.length - 1;

	while (left <= right) {
		const mid = Math.floor(left + (right - left) / 2);
		const midValue = arr[mid];

		// Type guard for `noUncheckedIndexedAccess`
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
