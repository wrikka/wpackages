import { delay, isExpired, now } from "./time";

const main = async () => {
	const startedAt = now();
	await delay(1);

	const expired = isExpired(startedAt, 0);
	return { expired };
};

void main();
