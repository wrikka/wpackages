export type Semaphore = {
	acquire: (permits?: number) => Promise<void>;
	release: (permits?: number) => void;
	runExclusive: <T>(callback: () => Promise<T>, permits?: number) => Promise<T>;
};
