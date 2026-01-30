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

export function diffieHellmanKeyExchange(p: number, g: number): { alice: { publicKey: number; privateKey: number }; bob: { publicKey: number; privateKey: number }; sharedSecret: number } {
	const a = Math.floor(Math.random() * (p - 2)) + 2;
	const b = Math.floor(Math.random() * (p - 2)) + 2;

	const A = modPow(g, a, p);
	const B = modPow(g, b, p);

	const sharedSecretA = modPow(B, a, p);
	const sharedSecretB = modPow(A, b, p);

	return {
		alice: { publicKey: A, privateKey: a },
		bob: { publicKey: B, privateKey: b },
		sharedSecret: sharedSecretA,
	};
}
