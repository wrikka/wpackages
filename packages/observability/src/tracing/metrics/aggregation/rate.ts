export interface RateData {
	count: number;
	sum: number;
	startTime: number;
	endTime: number;
}

export class RateCalculator {
	private count: number = 0;
	private sum: number = 0;
	private startTime: number = Date.now();

	increment(value: number = 1): void {
		this.count++;
		this.sum += value;
	}

	getRate(): RateData {
		const endTime = Date.now();

		return {
			count: this.count,
			sum: this.sum,
			startTime: this.startTime,
			endTime,
		};
	}

	getRatePerSecond(): number {
		const data = this.getRate();
		const durationSeconds = (data.endTime - data.startTime) / 1000;
		return durationSeconds > 0 ? data.count / durationSeconds : 0;
	}

	reset(): void {
		this.count = 0;
		this.sum = 0;
		this.startTime = Date.now();
	}
}

export function createRateCalculator(): RateCalculator {
	return new RateCalculator();
}
