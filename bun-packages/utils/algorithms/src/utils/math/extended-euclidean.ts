export function extendedEuclidean(a: number, b: number): { gcd: number; x: number; y: number } {
	if (b === 0) {
		return { gcd: a, x: 1, y: 0 };
	}

	const result = extendedEuclidean(b, a % b);
	const { gcd, x, y } = result;

	return {
		gcd,
		x: y,
		y: x - Math.floor(a / b) * y,
	};
}
