import { sleep } from "./sleep";

export const exampleSleep = async (): Promise<string> => {
	await sleep(10);
	return "done";
};
