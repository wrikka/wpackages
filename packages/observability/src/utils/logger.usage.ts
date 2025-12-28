import { createConsoleLogger } from "./logger";

const main = () => {
	const logger = createConsoleLogger();
	logger.log("info", "service-start", { pid: process.pid });
};

main();
