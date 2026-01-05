import path from "node:path";

export function generateCoverageReport(
	total: any,
	files: any[],
	thresholdsMet: boolean,
	thresholdFailures: string[],
): void {
	console.log("\n=== Coverage Report ===");
	console.log("Overall Coverage:");
	console.log(`  Lines:    ${total.lines.percentage}% (${total.lines.covered}/${total.lines.total})`);
	console.log(`  Functions: ${total.functions.percentage}% (${total.functions.covered}/${total.functions.total})`);
	console.log(`  Branches: ${total.branches.percentage}% (${total.branches.covered}/${total.branches.total})`);
	console.log(`  Statements: ${total.statements.percentage}% (${total.statements.covered}/${total.statements.total})`);

	if (files.length > 0) {
		console.log("\nFile Coverage:");
		for (const file of files) {
			console.log(`  ${file.path}:`);
			console.log(`    Lines:    ${file.lines?.percentage || 0}%`);
			console.log(`    Functions: ${file.functions?.percentage || 0}%`);
			console.log(`    Branches: ${file.branches?.percentage || 0}%`);
			console.log(`    Statements: ${file.statements?.percentage || 0}%`);
		}
	}

	if (!thresholdsMet) {
		console.log("\n❌ Coverage thresholds not met:");
		for (const failure of thresholdFailures) {
			console.log(`  - ${failure}`);
		}
	} else {
		console.log("\n✅ All coverage thresholds met!");
	}
}

export async function generateLcovReport(coverageData: any[], cwd: string): Promise<string> {
	let lcovContent = "TN:\n";

	for (const file of coverageData) {
		const sourcePath = path.relative(cwd, file.path);
		lcovContent += `SF:${sourcePath}\n`;

		if (file.functions?.details) {
			for (const func of file.functions.details) {
				lcovContent += `FN:${func.line},${func.name}\n`;
			}
		}

		if (file.functions?.details) {
			for (const func of file.functions.details) {
				const hit = func.hit ? 1 : 0;
				lcovContent += `FNDA:${hit},${func.name}\n`;
			}
			lcovContent += `FNF:${file.functions.total}\n`;
			lcovContent += `FNH:${file.functions.covered}\n`;
		}

		if (file.lines?.details) {
			for (const line of file.lines.details) {
				if (line.hit > 0) {
					lcovContent += `DA:${line.line},${line.hit}\n`;
				} else {
					lcovContent += `DA:${line.line},0\n`;
				}
			}
		}

		lcovContent += `LF:${file.lines?.total || 0}\n`;
		lcovContent += `LH:${file.lines?.covered || 0}\n`;
		lcovContent += `end_of_record\n`;
	}

	return lcovContent;
}
