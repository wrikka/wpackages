/**
 * Basic preview release example
 */

import { PreviewService } from "../src/index";

async function main() {
	const preview = new PreviewService();

	try {
		// Publish preview for current commit
		const result = await preview.publishPreview({
			ttl: 7, // Expire in 7 days
			dryRun: true,
		});

		console.log("✅ Preview published!");
		console.log(`📦 Package: ${result.packageName}@${result.version}`);
		console.log(`🔗 URL: ${result.url}`);
		console.log(`📥 Install: ${result.installCommand}`);

		if (result.expiresAt) {
			console.log(`⏰ Expires: ${result.expiresAt.toLocaleString()}`);
		}
	} catch (error) {
		console.error("❌ Failed:", error);
		process.exit(1);
	}
}

void main();
