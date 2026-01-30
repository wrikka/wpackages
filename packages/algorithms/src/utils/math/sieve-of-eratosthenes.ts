export function sieveOfEratosthenes(n: number): number[] {
	if (n < 2) {
		return [];
	}

	const isPrime = Array.from({ length: n + 1 }, () => true);
	const isPrimeAt0 = isPrime[0];
	const isPrimeAt1 = isPrime[1];

	if (isPrimeAt0 !== undefined) {
		isPrime[0] = false;
	}
	if (isPrimeAt1 !== undefined) {
		isPrime[1] = false;
	}

	for (let p = 2; p * p <= n; p++) {
		// If isPrime[p] is not changed, then it is a prime
		if (isPrime[p]) {
			// Update all multiples of p
			for (let i = p * p; i <= n; i += p) {
				isPrime[i] = false;
			}
		}
	}

	const primes: number[] = [];
	for (let p = 2; p <= n; p++) {
		if (isPrime[p]) {
			primes.push(p);
		}
	}

	return primes;
}
