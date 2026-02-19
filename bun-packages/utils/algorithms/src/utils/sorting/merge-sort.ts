function merge<T extends number | string>(left: T[], right: T[]): T[] {
	const result: T[] = [];
	let leftIndex = 0;
	let rightIndex = 0;

	while (leftIndex < left.length && rightIndex < right.length) {
		const leftEl = left[leftIndex];
		const rightEl = right[rightIndex];

		if (leftEl !== undefined && rightEl !== undefined) {
			if (leftEl < rightEl) {
				result.push(leftEl);
				leftIndex++;
			} else {
				result.push(rightEl);
				rightIndex++;
			}
		}
	}

	const remainingLeft = left.slice(leftIndex);
	const remainingRight = right.slice(rightIndex);

	return result.concat(remainingLeft).concat(remainingRight);
}

export function mergeSort<T extends number | string>(arr: T[]): T[] {
	if (arr.length <= 1) {
		return arr;
	}

	const middle = Math.floor(arr.length / 2);
	const left = arr.slice(0, middle);
	const right = arr.slice(middle);

	return merge(mergeSort(left), mergeSort(right));
}
