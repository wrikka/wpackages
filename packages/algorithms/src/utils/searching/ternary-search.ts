export function ternarySearch<T extends number | string>(
	arr: T[],
	target: T,
	left = 0,
	right = arr.length - 1,
): number {
	if (left > right) {
		return -1;
	}

	const third = Math.floor((right - left) / 3);
	const mid1 = left + third;
	const mid2 = right - third;

	const mid1Value = arr[mid1];
	const mid2Value = arr[mid2];

	if (mid1Value === undefined || mid2Value === undefined) {
		return -1;
	}

	if (mid1Value === target) {
		return mid1;
	}
	if (mid2Value === target) {
		return mid2;
	}

	if (target < mid1Value) {
		return ternarySearch(arr, target, left, mid1 - 1);
	}
	if (target > mid2Value) {
		return ternarySearch(arr, target, mid2 + 1, right);
	}

	return ternarySearch(arr, target, mid1 + 1, mid2 - 1);
}
