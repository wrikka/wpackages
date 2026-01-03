import { chromium } from "playwright-core";

export async function generatePdf(htmlContent: string, outputPath: string): Promise<void> {
	let browser = null;
	try {
		browser = await chromium.launch();
		const context = await browser.newContext();
		const page = await context.newPage();
		await page.setContent(htmlContent, { waitUntil: "networkidle" });
		await page.pdf({ path: outputPath, format: "A4", printBackground: true });
		console.log(`\n📄 Successfully generated PDF at ${outputPath}`);
	} catch (error) {
		console.error("\n❌ Error generating PDF:");
		console.error(error);
		throw error;
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}
