import { readFileSync, writeFileSync } from "fs";

export class PackageService {
	readPackageJson(path: string): any {
		const content = readFileSync(path, "utf-8");
		return JSON.parse(content);
	}

	writePackageJson(path: string, data: any): void {
		writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
	}
}
