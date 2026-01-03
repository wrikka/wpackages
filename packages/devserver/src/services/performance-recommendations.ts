import type { PerformanceStats } from "./performance-monitor.service";

export const getPerformanceRecommendations = (stats: PerformanceStats): string[] => {
	const recommendations: string[] = [];

	if (stats.totalFileEvents > 1000) {
		recommendations.push(
			"Consider adding more ignore patterns to reduce file watching overhead",
		);
	}

	if (stats.averageReloadTime > 1000) {
		recommendations.push(
			"Average reload time is high, consider optimizing your build process",
		);
	}

	if (stats.watchedFiles > 10000) {
		recommendations.push(
			"Watching too many files, consider reducing the scope of file watching",
		);
	}

	return recommendations;
};
