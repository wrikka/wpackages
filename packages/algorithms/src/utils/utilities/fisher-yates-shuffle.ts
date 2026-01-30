export function fisherYatesShuffle<T>(arr: T[]): T[] {
	const array = [...arr]; // Create a shallow copy to avoid modifying the original
	let currentIndex = array.length;
	let randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex !== 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		const temp = array[currentIndex];
		const random = array[randomIndex];
		if (temp !== undefined && random !== undefined) {
			[array[currentIndex], array[randomIndex]] = [random, temp];
		}
	}

	return array;
}
