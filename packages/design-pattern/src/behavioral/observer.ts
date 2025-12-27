/**
 * Observer Pattern - Pure functional implementation
 */

import type { Observer } from "../types";

export const createObservable = <T>() => {
	const observers: Observer<T>[] = [];
	return {
		subscribe: (observer: Observer<T>) => {
			observers.push(observer);
			return () => {
				const index = observers.indexOf(observer);
				if (index > -1) {
					observers.splice(index, 1);
				}
			};
		},
		notify: (value: T) => {
			for (const observer of observers) {
				observer(value);
			}
		},
		unsubscribeAll: () => {
			observers.length = 0;
		},
		count: () => observers.length,
	};
};

export const createSubject = <T>(initialValue: T) => {
	const observable = createObservable<T>();
	let value = initialValue;
	return {
		...observable,
		getValue: () => value,
		next: (newValue: T) => {
			value = newValue;
			observable.notify(value);
		},
	};
};
