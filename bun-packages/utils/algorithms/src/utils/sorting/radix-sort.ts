// Helper function to get the maximum value in an array
const getMax = (arr: number[]): number => {
	let max = 0;
	for (const num of arr) {
		if (num > max) {
			max = num;
		}
	}
	return max;
};

// A function to do counting sort of arr[] according to the digit represented by exp.
const countingSortForRadix = (arr: number[], exp: number): void => {
	const n = arr.length;
	const output = Array.from({ length: n }, () => 0);
	const count = Array.from({ length: 10 }, () => 0);

	// Store count of occurrences in count[]
	for (let i = 0; i < n; i++) {
		const num = arr[i];
		if (num !== undefined) {
			const index = Math.floor(num / exp) % 10;
			const countIndex = count[index];
			if (countIndex !== undefined) {
				count[index] = countIndex + 1;
			}
		}
	}

	// Change count[i] so that count[i] now contains actual
	// position of this digit in output[]
	for (let i = 1; i < 10; i++) {
		const currentCount = count[i];
		const prevCount = count[i - 1];
		if (currentCount !== undefined && prevCount !== undefined) {
			count[i] = currentCount + prevCount;
		}
	}

	// Build the output array
	for (let i = n - 1; i >= 0; i--) {
		const num = arr[i];
		if (num !== undefined) {
			const index = Math.floor(num / exp) % 10;
			const countIndex = count[index];
			if (countIndex !== undefined) {
				output[countIndex - 1] = num;
				count[index] = countIndex - 1;
			}
		}
	}

	// Copy the output array to arr[], so that arr[] now
	// contains sorted numbers according to current digit
	for (let i = 0; i < n; i++) {
		const val = output[i];
		if (val !== undefined) {
			arr[i] = val;
		}
	}
};

export function radixSort(arr: number[]): number[] {
	if (arr.length <= 1) {
		return [...arr];
	}

	for (const num of arr) {
		if (!Number.isInteger(num) || num < 0) {
			throw new Error("radixSort only supports non-negative integers");
		}
	}

	// Create a copy to avoid modifying the original array
	const array = [...arr];

	// Find the maximum number to know number of digits
	const max = getMax(array);

	// Do counting sort for every digit.
	for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
		countingSortForRadix(array, exp);
	}

	return array;
}
