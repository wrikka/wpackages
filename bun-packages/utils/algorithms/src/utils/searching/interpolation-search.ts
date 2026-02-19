export function interpolationSearch(arr: number[], target: number): number {
	let left = 0;
	let right = arr.length - 1;

	while (left <= right && target >= arr[left]! && target <= arr[right]!) {
		if (left === right) {
			if (arr[left]! === target) {
				return left;
			}
			return -1;
		}

		const pos =
			left +
			Math.floor(((target - arr[left]!) * (right - left)) / (arr[right]! - arr[left]!));

		const posValue = arr[pos];
		if (posValue === undefined) {
			return -1;
		}

		if (posValue === target) {
			return pos;
		}

		if (posValue < target) {
			left = pos + 1;
		} else {
			right = pos - 1;
		}
	}

	return -1;
}
