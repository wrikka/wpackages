export class HyperLogLog {
	private registers: number[];
	private m: number;
	private alphaMM: number;

	constructor(precision = 12) {
		this.m = 1 << precision;
		this.registers = Array(this.m).fill(0);
		this.alphaMM = 0.7213 / (1 + 1.079 / this.m);
	}

	private hash(value: string): number {
		let hash = 0;
		for (let i = 0; i < value.length; i++) {
			const char = value.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash;
		}
		return Math.abs(hash);
	}

	add(value: string): void {
		const x = this.hash(value);
		const j = x % this.m;
		const w = x >>> Math.floor(Math.log2(this.m));
		const rho = 32 - Math.clz32(w);
		this.registers[j]! = Math.max(this.registers[j]!, rho);
	}

	count(): number {
		const sum = this.registers.reduce((a, b) => a + Math.pow(2, -b), 0);
		const estimate = this.alphaMM * this.m * this.m / sum;

		if (estimate <= 2.5 * this.m) {
			const zeros = this.registers.filter((r) => r === 0).length;
			if (zeros !== 0) {
				return this.m * Math.log(this.m / zeros);
			}
		}

		return estimate;
	}
}
