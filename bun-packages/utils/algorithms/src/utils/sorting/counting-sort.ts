export function countingSort(arr: number[]): number[] {
	if (arr.length <= 1) {
		return [...arr];
	}

	let max = 0;
	for (const num of arr) {
		if (num > max) {
			max = num;
		}
	}

	const count = Array.from({ length: max + 1 }, () => 0);

	for (const num of arr) {
		if (num !== undefined) {
			const countIndex = count[num];
			if (countIndex !== undefined) {
				count[num] = countIndex + 1;
			}
		}
	}

	const sortedArray: number[] = [];
	for (let i = 0; i <= max; i++) {
		const numCount = count[i];
		if (numCount !== undefined) {
			for (let j = 0; j < numCount; j++) {
				sortedArray.push(i);
			}
		}
	}

	return sortedArray;
}
