export function defineSlots<T extends Record<string, (...args: any[]) => void>>(): T {
	return {} as T;
}
