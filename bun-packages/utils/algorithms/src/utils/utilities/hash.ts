export function simpleHash(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return hash;
}

export function djb2Hash(str: string): number {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 33) ^ str.charCodeAt(i);
	}
	return hash >>> 0;
}

export function sdbmHash(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
		hash = hash & hash;
	}
	return hash;
}

export function fnv1aHash(str: string): number {
	let hash = 2166136261;
	for (let i = 0; i < str.length; i++) {
		hash ^= str.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

export function murmurHash3(str: string, seed = 0): number {
	let h1 = seed;
	const remainder = str.length & 3;
	const bytes = str.length - remainder;
	const c1 = 0xcc9e2d51;
	const c2 = 0x1b873593;

	for (let i = 0; i < bytes; i += 4) {
		let k1 = str.charCodeAt(i) | (str.charCodeAt(i + 1) << 8) | (str.charCodeAt(i + 2) << 16) | (str.charCodeAt(i + 3) << 24);
		k1 = Math.imul(k1, c1);
		k1 = (k1 << 15) | (k1 >>> 17);
		k1 = Math.imul(k1, c2);
		h1 ^= k1;
		h1 = (h1 << 13) | (h1 >>> 19);
		h1 = Math.imul(h1, 5) + 0xe6546b64;
	}

	let k1 = 0;
	if (remainder > 0) {
		if (remainder === 3) {
			k1 ^= str.charCodeAt(bytes + 2) << 16;
		}
		if (remainder >= 2) {
			k1 ^= str.charCodeAt(bytes + 1) << 8;
		}
		k1 ^= str.charCodeAt(bytes);
		k1 = Math.imul(k1, c1);
		k1 = (k1 << 15) | (k1 >>> 17);
		k1 = Math.imul(k1, c2);
		h1 ^= k1;
	}

	h1 ^= str.length;
	h1 ^= h1 >>> 16;
	h1 = Math.imul(h1, 0x85ebca6b);
	h1 ^= h1 >>> 13;
	h1 = Math.imul(h1, 0xc2b2ae35);
	h1 ^= h1 >>> 16;

	return h1 >>> 0;
}
