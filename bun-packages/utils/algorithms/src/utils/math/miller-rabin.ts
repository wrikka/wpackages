function modPow(base: number, exponent: number, modulus: number): number {
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

function millerRabinTest(d: number, n: number): boolean {
	const a = 2 + Math.floor(Math.random() * (n - 4));
	let x = modPow(a, d, n);

	if (x === 1 || x === n - 1) return true;

	while (d !== n - 1) {
		x = (x * x) % n;
		d *= 2;

		if (x === 1) return false;
		if (x === n - 1) return true;
	}

	return false;
}

export function millerRabin(n: number, k = 5): boolean {
	if (n <= 1) return false;
	if (n <= 3) return true;
	if (n % 2 === 0) return false;

	let d = n - 1;
	while (d % 2 === 0) {
		d = Math.floor(d / 2);
	}

	for (let i = 0; i < k; i++) {
		if (!millerRabinTest(d, n)) {
			return false;
		}
	}

	return true;
}
