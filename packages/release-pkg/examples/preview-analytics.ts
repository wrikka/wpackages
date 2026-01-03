/**
 * Preview analytics example - track usage and generate reports
 */

import { AnalyticsService } from "release";

async function main() {
	const analytics = new AnalyticsService();

	// Simulate tracking events
	await analytics.trackEvent({
		type: "download",
		packageName: "release",
		version: "1.0.0-preview.123",
		userId: "user-1",
		country: "TH",
		referrer: "github.com",
	});

	await analytics.trackEvent({
		type: "playground",
		packageName: "release",
		version: "1.0.0-preview.123",
		userId: "user-2",
		country: "US",
		referrer: "stackblitz.com",
	});

	// Get stats
	const stats = await analytics.getPreviewStats(
		"release",
		"1.0.0-preview.123",
	);

	console.log("📊 Preview Statistics:");
	console.log(`Downloads: ${stats.downloads}`);
	console.log(`Unique Users: ${stats.uniqueUsers}`);
	console.log(`Playground Opens: ${stats.playgroundOpens}`);
	console.log(`Average Test Time: ${stats.averageTestTime.toFixed(1)} min`);

	if (stats.topCountries.length > 0) {
		console.log("\n🌍 Top Countries:");
		for (const { country, count } of stats.topCountries) {
			console.log(`  ${country}: ${count}`);
		}
	}

	// Generate report
	const report = analytics.generateReport(stats);
	console.log("\n" + report);
}

void main();
