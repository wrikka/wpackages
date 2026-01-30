// Function to calculate the Z-array for a given string
const calculateZArray = (str: string): number[] => {
	const n = str.length;
	const z = Array.from({ length: n }, () => 0);
	let l = 0;
	let r = 0;

	for (let i = 1; i < n; i++) {
		if (i <= r) {
			const z_r = z[i - l];
			if (z_r !== undefined) {
				z[i] = Math.min(r - i + 1, z_r);
			}
		}

		while (i + (z[i] ?? 0) < n) {
			const charZ = str[z[i] ?? 0];
			const charIPlusZ = str[i + (z[i] ?? 0)];
			if (charZ !== charIPlusZ) {
				break;
			}
			const z_i = z[i];
			if (z_i !== undefined) {
				z[i] = z_i + 1;
			}
		}

		const z_i = z[i];
		if (z_i !== undefined && i + z_i - 1 > r) {
			l = i;
			r = i + z_i - 1;
		}
	}
	return z;
};

export function zAlgorithmSearch(text: string, pattern: string): number[] {
	const m = pattern.length;
	if (m === 0) {
		return [];
	}

	const concat = pattern + "$" + text;
	const z = calculateZArray(concat);
	const occurrences: number[] = [];

	for (let i = 0; i < z.length; i++) {
		const z_i = z[i];
		if (z_i === m) {
			occurrences.push(i - m - 1);
		}
	}

	return occurrences;
}
