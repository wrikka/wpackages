import type { ComparisonResult } from "../types";

export type RegressionResult = {
	command: string;
	currentMean: number;
	baseMean: number;
	diffPercentage: number;
	isRegression: boolean;
};

export const checkRegression = async (
	currentPath: string,
	basePath: string,
	threshold: number,
): Promise<RegressionResult[]> => {
	const currentResult: ComparisonResult = JSON.parse(await Bun.file(currentPath).text());
	const baseResult: ComparisonResult = JSON.parse(await Bun.file(basePath).text());

	const baseMeans = new Map(baseResult.results.map(r => [r.command, r.mean]));
	const regressions: RegressionResult[] = [];

	for (const current of currentResult.results) {
		const baseMean = baseMeans.get(current.command);
		if (baseMean) {
			const diffPercentage = ((current.mean - baseMean) / baseMean) * 100;
			regressions.push({
				command: current.command,
				currentMean: current.mean,
				baseMean,
				diffPercentage,
				isRegression: diffPercentage > threshold,
			});
		}
	}

	return regressions;
};
