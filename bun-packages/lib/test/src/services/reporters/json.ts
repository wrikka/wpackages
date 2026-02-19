/**
 * JSON reporter
 */

import type { TestReport } from "../../types";

export const generateJsonReport = (report: TestReport): string => {
	return JSON.stringify(report, null, 2);
};
