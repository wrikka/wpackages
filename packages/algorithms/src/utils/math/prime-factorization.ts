export function primeFactorization(n: number): number[] {
	const factors: number[] = [];
	let divisor = 2;

	while (n >= 2) {
		while (n % divisor === 0) {
			factors.push(divisor);
			n = n / divisor;
		}
		divisor++;
	}

	return factors;
}
