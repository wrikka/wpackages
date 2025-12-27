export interface PreviewStats {
	downloads: number;
	uniqueUsers: number;
	playgroundOpens: number;
	averageTestTime: number;
	topCountries: Array<{ country: string; count: number }>;
	topReferrers: Array<{ referrer: string; count: number }>;
	lastAccessed: Date;
}

export interface AnalyticsEvent {
	type: "download" | "install" | "playground" | "view";
	packageName: string;
	version: string;
	timestamp: Date;
	userAgent?: string;
	referrer?: string;
	country?: string;
	userId?: string;
}

export class AnalyticsService {
	private events: AnalyticsEvent[] = [];

	/**
	 * Track an analytics event
	 */
	async trackEvent(event: Omit<AnalyticsEvent, "timestamp">): Promise<void> {
		this.events.push({
			...event,
			timestamp: new Date(),
		});

		// In production, this would send to analytics service
		if (process.env["ANALYTICS_ENDPOINT"]) {
			await this.sendToAnalytics(event);
		}
	}

	/**
	 * Get preview statistics
	 */
	async getPreviewStats(
		packageName: string,
		version: string,
	): Promise<PreviewStats> {
		const packageEvents = this.events.filter(
			(e) => e.packageName === packageName && e.version === version,
		);

		const downloads = packageEvents.filter(
			(e) => e.type === "download" || e.type === "install",
		).length;

		const uniqueUsers = new Set(
			packageEvents.map((e) => e.userId).filter(Boolean),
		).size;

		const playgroundOpens = packageEvents.filter(
			(e) => e.type === "playground",
		).length;

		// Calculate average test time (time between first and last access)
		const times = packageEvents.map((e) => e.timestamp.getTime());
		const averageTestTime = times.length > 1
			? (Math.max(...times) - Math.min(...times)) / 1000 / 60
			: 0;

		// Count by country
		const countryCount = new Map<string, number>();
		for (const event of packageEvents) {
			if (event.country) {
				countryCount.set(event.country, (countryCount.get(event.country) || 0) + 1);
			}
		}

		const topCountries = Array.from(countryCount.entries())
			.map(([country, count]) => ({ country, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);

		// Count by referrer
		const referrerCount = new Map<string, number>();
		for (const event of packageEvents) {
			if (event.referrer) {
				referrerCount.set(
					event.referrer,
					(referrerCount.get(event.referrer) || 0) + 1,
				);
			}
		}

		const topReferrers = Array.from(referrerCount.entries())
			.map(([referrer, count]) => ({ referrer, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);

		const lastAccessed = times.length > 0 ? new Date(Math.max(...times)) : new Date();

		return {
			downloads,
			uniqueUsers,
			playgroundOpens,
			averageTestTime,
			topCountries,
			topReferrers,
			lastAccessed,
		};
	}

	/**
	 * Get all stats for a package
	 */
	async getAllStats(packageName: string): Promise<Map<string, PreviewStats>> {
		const versions = new Set(
			this.events.filter((e) => e.packageName === packageName).map((e) => e.version),
		);

		const stats = new Map<string, PreviewStats>();

		for (const version of versions) {
			stats.set(version, await this.getPreviewStats(packageName, version));
		}

		return stats;
	}

	/**
	 * Send event to analytics service
	 */
	private async sendToAnalytics(
		event: Omit<AnalyticsEvent, "timestamp">,
	): Promise<void> {
		try {
			const endpoint = process.env["ANALYTICS_ENDPOINT"];
			if (!endpoint) return;

			await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...event,
					timestamp: new Date().toISOString(),
				}),
			});
		} catch (error) {
			console.warn("Failed to send analytics:", error);
		}
	}

	/**
	 * Generate analytics report
	 */
	generateReport(stats: PreviewStats): string {
		let report = "📊 Preview Analytics Report\n\n";

		report += `📥 Downloads: ${stats.downloads}\n`;
		report += `👥 Unique Users: ${stats.uniqueUsers}\n`;
		report += `🎮 Playground Opens: ${stats.playgroundOpens}\n`;
		report += `⏱️  Average Test Time: ${stats.averageTestTime.toFixed(1)} minutes\n`;
		report += `🕐 Last Accessed: ${stats.lastAccessed.toLocaleString()}\n\n`;

		if (stats.topCountries.length > 0) {
			report += "🌍 Top Countries:\n";
			for (const { country, count } of stats.topCountries) {
				report += `  - ${country}: ${count}\n`;
			}
			report += "\n";
		}

		if (stats.topReferrers.length > 0) {
			report += "🔗 Top Referrers:\n";
			for (const { referrer, count } of stats.topReferrers) {
				report += `  - ${referrer}: ${count}\n`;
			}
		}

		return report;
	}
}
