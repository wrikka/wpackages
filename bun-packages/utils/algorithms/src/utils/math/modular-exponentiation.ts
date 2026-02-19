export function modularExponentiation(base: number, exponent: number, modulus: number): number {
	if (modulus === 1) return 0;

	let result = 1;
	base = base % modulus;

	while (exponent > 0) {
		if (exponent % 2 === 1) {
			result = (result * base) % modulus;
		}
		exponent = Math.floor(exponent / 2);
		base = (base * base) % modulus;
	}

	return result;
}
