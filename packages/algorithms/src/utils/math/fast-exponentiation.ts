export function fastExponentiation(base: number, exponent: number): number {
	let result = 1;
	let b = base;
	let e = exponent;

	while (e > 0) {
		if (e % 2 === 1) {
			result *= b;
		}
		b *= b;
		e = Math.floor(e / 2);
	}

	return result;
}
