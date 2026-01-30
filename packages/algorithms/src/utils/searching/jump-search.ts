export function jumpSearch<T extends number | string>(
	arr: T[],
	target: T,
): number {
	const n = arr.length;
	if (n === 0) {
		return -1;
	}

	const step = Math.floor(Math.sqrt(n));
	let prev = 0;
	let currentStep = step;

	while ((arr[Math.min(currentStep, n) - 1] ?? Infinity) < target) {
		prev = currentStep;
		currentStep += step;
		if (prev >= n) {
			return -1;
		}
	}

	// Linear search for target in block beginning with prev.
	for (let i = prev; i < Math.min(currentStep, n); i++) {
		const current = arr[i];
		if (current === target) {
			return i;
		}
	}

	return -1;
}
