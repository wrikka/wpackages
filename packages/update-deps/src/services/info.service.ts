import packageJson from "package-json";
import type { VulnerabilityInfo } from "../types";

export class InfoService {
	async getChangelogInfo(pkgName: string): Promise<string> {
		try {
			const pkg = await packageJson(pkgName, { fullMetadata: true });
			if (pkg.repository?.url) {
				const repoUrl = pkg.repository.url.replace("git+", "").replace(".git", "");
				if (repoUrl.includes("github.com")) {
					return `${repoUrl}/releases`;
				}
			}
		} catch (error) {
			// ignore
		}
		return "";
	}

	async getVulnerabilityInfo(
		packages: { name: string; version: string }[],
	): Promise<Record<string, VulnerabilityInfo>> {
		if (packages.length === 0) {
			return {};
		}
		try {
			const response = await fetch("https://api.osv.dev/v1/querybatch", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					queries: packages.map(p => ({ package: { name: p.name, ecosystem: "npm" }, version: p.version })),
				}),
			});
			if (!response.ok) return {};

			const data = (await response.json()) as { results: { vulns: any[] }[] };
			const results: Record<string, VulnerabilityInfo> = {};

			for (const [index, res] of data.results.entries()) {
				const pkg = packages[index];
				if (res.vulns && pkg) {
					results[pkg.name] = {
						summary: `🔥 ${res.vulns.length} vulnerabilities`,
						count: res.vulns.length,
					};
				}
			}
			return results;
		} catch (error) {
			return {};
		}
	}
}
