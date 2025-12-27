export type Mutex = {
	acquire: () => Promise<void>;
	release: () => void;
	runExclusive: <T>(callback: () => Promise<T>) => Promise<T>;
};
