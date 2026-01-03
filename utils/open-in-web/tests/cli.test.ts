import { describe, expect, test } from "bun:test";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const cliEntry = path.resolve(import.meta.dir, "../src/index.ts");
const exampleMd = path.resolve(import.meta.dir, "../examples-files/example.md");
const outputDir = path.resolve(import.meta.dir, "output");

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir);
}

describe("CLI Tests", () => {
	test("should export to HTML", () => {
		const outputFile = path.join(outputDir, "output.html");
		const command = `bun run ${cliEntry} ${exampleMd} --output ${outputFile}`;
		execSync(command);
		expect(fs.existsSync(outputFile)).toBe(true);
		const content = fs.readFileSync(outputFile, "utf-8");
		expect(content).toContain("<h1>Example Markdown</h1>");
	});

	test("should export to PDF", () => {
		const outputFile = path.join(outputDir, "output.pdf");
		const command = `bun run ${cliEntry} ${exampleMd} --pdf ${outputFile}`;
		execSync(command, { stdio: "inherit" }); // Show output for debugging playwright
		expect(fs.existsSync(outputFile)).toBe(true);
	}, 30000); // Increase timeout for PDF generation

	test("should generate TOC", () => {
		const outputFile = path.join(outputDir, "output-toc.html");
		const command = `bun run ${cliEntry} ${exampleMd} --toc --output ${outputFile}`;
		execSync(command);
		const content = fs.readFileSync(outputFile, "utf-8");
		expect(content).toContain("<ul class=\"markdown-it-toc-list\">");
	});
});
