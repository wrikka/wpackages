export function chineseRemainderTheorem(a: number[], m: number[]): number {
	const n = a.length;
	if (n !== m.length) throw new Error("Arrays must have the same length");
	if (n === 0) throw new Error("Arrays must not be empty");

	let result = a[0]!;
	let currentM = m[0]!;

	for (let i = 1; i < n; i++) {
		const nextA = a[i]!;
		const nextM = m[i]!;

		const [g, p] = extendedGCD(currentM, nextM);

		if ((nextA - result) % g !== 0) {
			throw new Error("No solution exists");
		}

		const lcm = (currentM / g) * nextM;
		result = result + currentM * ((nextA - result) / g) * p;
		result = ((result % lcm) + lcm) % lcm;
		currentM = lcm;
	}

	return result;
}

function extendedGCD(a: number, b: number): [number, number, number] {
	if (b === 0) return [a, 1, 0];

	const [g, x, y] = extendedGCD(b, a % b);
	return [g, y, x - Math.floor(a / b) * y];
}
