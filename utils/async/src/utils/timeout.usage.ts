import { sleep } from "./sleep";
import { withTimeout } from "./timeout";

export const exampleWithTimeout = async (): Promise<void> => {
	await withTimeout(sleep(5), 100);
};
