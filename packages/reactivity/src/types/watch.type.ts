export type WatchCallback<T> = (value: T, oldValue: T) => void;

export type WatchOptions = {
	immediate?: boolean;
};
