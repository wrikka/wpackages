export function kadanesAlgorithm(arr: number[]): number {
	if (arr.length === 0) {
		return 0;
	}

	let maxSoFar = arr[0] ?? 0;
	let maxEndingHere = arr[0] ?? 0;

	for (let i = 1; i < arr.length; i++) {
		const num = arr[i];
		if (num !== undefined) {
			maxEndingHere = Math.max(num, maxEndingHere + num);
			maxSoFar = Math.max(maxSoFar, maxEndingHere);
		}
	}

	return maxSoFar;
}
