import type { TestReport } from "../types/report";
import { formatReport } from "../utils/report.util";

export const printReport = (report: TestReport): void => {
	console.log(formatReport(report));
};
