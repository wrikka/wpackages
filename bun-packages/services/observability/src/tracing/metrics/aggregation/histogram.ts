export interface HistogramConfig {
	boundaries: number[];
	aggregationTemporality: "delta" | "cumulative";
}

export interface HistogramData {
	count: number;
	sum: number;
	bucketCounts: number[];
}

export class Histogram {
	private config: HistogramConfig;
	private data: HistogramData;

	constructor(config: HistogramConfig) {
		this.config = config;
		this.data = {
			count: 0,
			sum: 0,
			bucketCounts: Array.from({ length: config.boundaries.length + 1 }, () => 0),
		};
	}

	record(value: number): void {
		this.data.count++;
		this.data.sum += value;

		let bucketIndex = this.config.boundaries.length;
		for (let i = 0; i < this.config.boundaries.length; i++) {
			const boundary = this.config.boundaries[i];
			if (boundary !== undefined && value <= boundary) {
				bucketIndex = i;
				break;
			}
		}

		this.data.bucketCounts[bucketIndex] = (this.data.bucketCounts[bucketIndex] ?? 0) + 1;
	}

	getData(): HistogramData {
		return { ...this.data };
	}

	reset(): void {
		this.data = {
			count: 0,
			sum: 0,
			bucketCounts: Array.from({ length: this.config.boundaries.length + 1 }, () => 0),
		};
	}

	calculatePercentile(percentile: number): number {
		if (this.data.count === 0) {
			return 0;
		}

		const targetCount = this.data.count * (percentile / 100);
		let cumulativeCount = 0;

		for (let i = 0; i < this.data.bucketCounts.length; i++) {
			cumulativeCount += this.data.bucketCounts[i] || 0;
			if (cumulativeCount >= targetCount) {
				if (i === 0) {
					return 0;
				}
				const boundary = this.config.boundaries[i - 1];
				return boundary !== undefined ? boundary : 0;
			}
		}

		const lastBoundary = this.config.boundaries[this.config.boundaries.length - 1];
		return lastBoundary !== undefined ? lastBoundary : 0;
	}
}

export function createHistogram(config: HistogramConfig): Histogram {
	return new Histogram(config);
}
