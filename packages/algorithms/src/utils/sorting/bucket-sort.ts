export function bucketSort(arr: number[], bucketSize = 5): number[] {
	if (arr.length === 0) {
		return [];
	}

	let minValue = arr[0];
	let maxValue = arr[0];

	for (let i = 1; i < arr.length; i++) {
		if (arr[i]! < minValue!) {
			minValue = arr[i];
		}
		if (arr[i]! > maxValue!) {
			maxValue = arr[i];
		}
	}

	const bucketCount = Math.floor((maxValue! - minValue!) / bucketSize) + 1;
	const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

	for (let i = 0; i < arr.length; i++) {
		const bucketIndex = Math.floor((arr[i]! - minValue!) / bucketSize);
		buckets[bucketIndex]!.push(arr[i]!);
	}

	for (let i = 0; i < bucketCount; i++) {
		buckets[i]!.sort((a, b) => a - b);
	}

	const result: number[] = [];
	for (let i = 0; i < bucketCount; i++) {
		result.push(...buckets[i]!);
	}

	return result;
}
