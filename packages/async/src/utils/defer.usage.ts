import { defer } from "./defer";

export const exampleDefer = async (): Promise<number> => {
	const d = defer<number>();

	queueMicrotask(() => {
		d.resolve(1);
	});

	return await d.promise;
};
