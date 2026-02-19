export function cycleSort<T>(arr: T[]): T[] {
	const result = [...arr];
	const n = result.length;

	for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
		let item = result[cycleStart]!;
		let pos = cycleStart;

		for (let i = cycleStart + 1; i < n; i++) {
			if (result[i]! < item) {
				pos++;
			}
		}

		if (pos === cycleStart) {
			continue;
		}

		while (item === result[pos]!) {
			pos++;
		}

		[result[pos]!, item] = [item, result[pos]!];

		while (pos !== cycleStart) {
			pos = cycleStart;

			for (let i = cycleStart + 1; i < n; i++) {
				if (result[i]! < item) {
					pos++;
				}
			}

			while (item === result[pos]!) {
				pos++;
			}

			[result[pos]!, item] = [item, result[pos]!];
		}
	}

	return result;
}
