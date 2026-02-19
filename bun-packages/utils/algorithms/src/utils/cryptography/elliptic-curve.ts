export class ECPoint {
	constructor(public x: number | null, public y: number | null) {}

	equals(other: ECPoint): boolean {
		return this.x === other.x && this.y === other.y;
	}

	isInfinity(): boolean {
		return this.x === null && this.y === null;
	}
}

export class EllipticCurve {
	constructor(private a: number, private b: number, private p: number) {}

	add(p1: ECPoint, p2: ECPoint): ECPoint {
		if (p1.isInfinity()) return p2;
		if (p2.isInfinity()) return p1;

		if (p1.x === p2.x && p1.y !== p2.y) {
			return new ECPoint(null, null);
		}

		let lambda: number;

		if (p1.equals(p2)) {
			lambda = (3 * p1.x! * p1.x! + this.a) * this.modInverse(2 * p1.y!, this.p);
		} else {
			lambda = (p2.y! - p1.y!) * this.modInverse(p2.x! - p1.x!, this.p);
		}

		lambda = ((lambda % this.p) + this.p) % this.p;

		const x3 = (lambda * lambda - p1.x! - p2.x!) % this.p;
		const y3 = (lambda * (p1.x! - x3) - p1.y!) % this.p;

		return new ECPoint(x3, y3);
	}

	multiply(p: ECPoint, k: number): ECPoint {
		let result = new ECPoint(null, null);
		let addend = p;

		while (k > 0) {
			if (k % 2 === 1) {
				result = this.add(result, addend);
			}
			addend = this.add(addend, addend);
			k = Math.floor(k / 2);
		}

		return result;
	}

	private modInverse(a: number, m: number): number {
		const { gcd, x } = this.extendedGCD(a, m);

		if (gcd !== 1) {
			throw new Error("Modular inverse does not exist");
		}

		return ((x % m) + m) % m;
	}

	private extendedGCD(a: number, b: number): { gcd: number; x: number; y: number } {
		if (b === 0) {
			return { gcd: a, x: 1, y: 0 };
		}

		const result = this.extendedGCD(b, a % b);
		const { gcd, x, y } = result;

		return {
			gcd,
			x: y,
			y: x - Math.floor(a / b) * y,
		};
	}
}
