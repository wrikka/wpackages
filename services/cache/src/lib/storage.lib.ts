/**
 * Third-party library wrappers
 */

/**
 * Wrapper for localStorage with caching functionality
 */
export const createLocalStorageCache = <T>(key: string) => {
	// This would be implemented in a browser environment
	return {
		get: (): T | null => {
			try {
				const item = localStorage.getItem(key);
				return item ? JSON.parse(item) : null;
			} catch {
				return null;
			}
		},
		set: (value: T): void => {
			try {
				localStorage.setItem(key, JSON.stringify(value));
			} catch (error) {
				console.warn(`Failed to set localStorage item ${key}:`, error);
			}
		},
		remove: (): void => {
			localStorage.removeItem(key);
		},
	};
};

/**
 * Wrapper for sessionStorage with caching functionality
 */
export const createSessionStorageCache = <T>(key: string) => {
	// This would be implemented in a browser environment
	return {
		get: (): T | null => {
			try {
				const item = sessionStorage.getItem(key);
				return item ? JSON.parse(item) : null;
			} catch {
				return null;
			}
		},
		set: (value: T): void => {
			try {
				sessionStorage.setItem(key, JSON.stringify(value));
			} catch (error) {
				console.warn(`Failed to set sessionStorage item ${key}:`, error);
			}
		},
		remove: (): void => {
			sessionStorage.removeItem(key);
		},
	};
};
