import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { generateHTML, generateJUnitXML, generateTAP, generateTeamCity } from "./reporter-plugins";
import type { JUnitTestCase, JUnitTestSuite, TAPTest, TeamCityMessage } from "./reporter-plugins";

class ReporterPlugins {
	private cwd: string;

	constructor(cwd: string) {
		this.cwd = cwd;
	}

	// JUnit XML Reporter
	generateJUnitXML(testResults: any): string {
		return generateJUnitXML(testResults);
	}

	// TAP (Test Anything Protocol) Reporter
	generateTAP(testResults: any): string {
		return generateTAP(testResults);
	}

	// TeamCity Reporter
	generateTeamCity(testResults: any): string[] {
		return generateTeamCity(testResults);
	}

	// HTML Reporter (enhanced)
	generateHTML(testResults: any, coverageData?: any): string {
		return generateHTML(testResults, coverageData);
	}

	// Save reports to files
	saveJUnitXML(testResults: any, outputPath: string = "test-results.xml"): void {
		const xml = this.generateJUnitXML(testResults);
		const fullPath = path.resolve(this.cwd, outputPath);
		const dir = path.dirname(fullPath);

		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}

		writeFileSync(fullPath, xml, "utf8");
	}

	saveTAP(testResults: any, outputPath: string = "test-results.tap"): void {
		const tap = this.generateTAP(testResults);
		const fullPath = path.resolve(this.cwd, outputPath);
		const dir = path.dirname(fullPath);

		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}

		writeFileSync(fullPath, tap, "utf8");
	}

	saveTeamCity(testResults: any, outputPath: string = "teamcity-output.log"): void {
		const messages = this.generateTeamCity(testResults);
		const content = messages.join("\n");
		const fullPath = path.resolve(this.cwd, outputPath);
		const dir = path.dirname(fullPath);

		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}

		writeFileSync(fullPath, content, "utf8");
	}

	saveHTML(testResults: any, coverageData?: any, outputPath: string = "test-report.html"): void {
		const html = this.generateHTML(testResults, coverageData);
		const fullPath = path.resolve(this.cwd, outputPath);
		const dir = path.dirname(fullPath);

		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}

		writeFileSync(fullPath, html, "utf8");
	}
}

export function createReporterPlugins(cwd: string): ReporterPlugins {
	return new ReporterPlugins(cwd);
}

export { type JUnitTestCase, type JUnitTestSuite, ReporterPlugins, type TAPTest, type TeamCityMessage };
