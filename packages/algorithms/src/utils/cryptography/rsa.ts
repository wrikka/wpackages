export function modInverse(a: number, m: number): number {
	const { gcd, x } = extendedEuclidean(a, m);

	if (gcd !== 1) {
		throw new Error("Modular inverse does not exist");
	}

	return ((x % m) + m) % m;
}

function extendedEuclidean(a: number, b: number): { gcd: number; x: number; y: number } {
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

export function generateRSAKeys(): { publicKey: { e: number; n: number }; privateKey: { d: number; n: number } } {
	const p = 61;
	const q = 53;
	const n = p * q;
	const phi = (p - 1) * (q - 1);
	const e = 17;
	const d = modInverse(e, phi);

	return {
		publicKey: { e, n },
		privateKey: { d, n },
	};
}

export function rsaEncrypt(message: number, publicKey: { e: number; n: number }): number {
	return modPow(message, publicKey.e, publicKey.n);
}

export function rsaDecrypt(ciphertext: number, privateKey: { d: number; n: number }): number {
	return modPow(ciphertext, privateKey.d, privateKey.n);
}

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
