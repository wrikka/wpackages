export interface MemoOptions<T> {
	equals?: false | ((prev: T, next: T) => boolean);
}
