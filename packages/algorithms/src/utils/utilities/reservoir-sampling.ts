export function reservoirSampling<T>(stream: T[], k: number): T[] {
	if (k < 0) {
		return [];
	}

	const reservoir: T[] = [];
	let i = 0;

	// Fill the reservoir with the first k items
	for (i = 0; i < k && i < stream.length; i++) {
		const item = stream[i];
		if (item !== undefined) {
			reservoir.push(item);
		}
	}

	// Replace elements with gradually decreasing probability
	for (; i < stream.length; i++) {
		const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
		const item = stream[i];

		if (j < k && item !== undefined) {
			reservoir[j] = item;
		}
	}

	return reservoir;
}
