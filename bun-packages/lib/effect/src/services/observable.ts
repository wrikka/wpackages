import type { BehaviorSubject, Observable, Observer, ReplaySubject, Subject, Unsubscribe } from "../types/observable";

export const createObservable = <A>(
	subscribe: (observer: Observer<A>) => Unsubscribe,
): Observable<A> => ({
	_tag: "Observable",
	subscribe,
});

export const fromEvent = <A>(
	target: EventTarget,
	eventName: string,
): Observable<A> => {
	return createObservable((observer) => {
		const handler = (event: Event) => observer.next(event as A);
		target.addEventListener(eventName, handler);
		return () => target.removeEventListener(eventName, handler);
	});
};

export const fromPromise = <A>(promise: Promise<A>): Observable<A> => {
	return createObservable((observer) => {
		promise
			.then((value) => {
				observer.next(value);
				observer.complete();
			})
			.catch((error) => observer.error(error));
		return () => {};
	});
};

export const map = <A, B>(f: (a: A) => B) => (observable: Observable<A>): Observable<B> => {
	return createObservable((observer) => {
		return observable.subscribe({
			next: (value) => observer.next(f(value)),
			error: (error) => observer.error(error),
			complete: () => observer.complete(),
		});
	});
};

export const filter = <A>(predicate: (a: A) => boolean) => (observable: Observable<A>): Observable<A> => {
	return createObservable((observer) => {
		return observable.subscribe({
			next: (value) => {
				if (predicate(value)) {
					observer.next(value);
				}
			},
			error: (error) => observer.error(error),
			complete: () => observer.complete(),
		});
	});
};

export const tap = <A>(f: (a: A) => void) => (observable: Observable<A>): Observable<A> => {
	return createObservable((observer) => {
		return observable.subscribe({
			next: (value) => {
				f(value);
				observer.next(value);
			},
			error: (error) => observer.error(error),
			complete: () => observer.complete(),
		});
	});
};

export const take = <A>(n: number) => (observable: Observable<A>): Observable<A> => {
	return createObservable((observer) => {
		let count = 0;
		const unsubscribe = observable.subscribe({
			next: (value) => {
				if (count < n) {
					count++;
					observer.next(value);
					if (count === n) {
						unsubscribe();
						observer.complete();
					}
				}
			},
			error: (error) => observer.error(error),
			complete: () => observer.complete(),
		});
		return unsubscribe;
	});
};

export const debounceTime = <A>(ms: number) => (observable: Observable<A>): Observable<A> => {
	return createObservable((observer) => {
		let timeoutId: ReturnType<typeof setTimeout>;
		const unsubscribe = observable.subscribe({
			next: (value) => {
				clearTimeout(timeoutId);
				timeoutId = setTimeout(() => {
					observer.next(value);
				}, ms);
			},
			error: (error) => observer.error(error),
			complete: () => observer.complete(),
		});
		return () => {
			clearTimeout(timeoutId);
			unsubscribe();
		};
	});
};

export const createSubject = <A>(): Subject<A> => {
	const observers = new Set<Observer<A>>();

	return {
		_tag: "Subject",
		subscribe: (observer) => {
			observers.add(observer);
			return () => observers.delete(observer);
		},
		next: (value) => {
			observers.forEach((obs) => obs.next(value));
		},
		error: (error) => {
			observers.forEach((obs) => obs.error(error));
		},
		complete: () => {
			observers.forEach((obs) => obs.complete());
		},
	};
};

export const createBehaviorSubject = <A>(
	initialValue: A,
): BehaviorSubject<A> => {
	const subject = createSubject<A>() as BehaviorSubject<A>;
	let currentValue = initialValue;

	return {
		...subject,
		_tag: "BehaviorSubject",
		getValue: () => currentValue,
		next: (value) => {
			currentValue = value;
			(subject as Subject<A>).next(value);
		},
	};
};

export const createReplaySubject = <A>(
	bufferSize = Infinity,
): ReplaySubject<A> => {
	const subject = createSubject<A>() as ReplaySubject<A>;
	const buffer: A[] = [];

	return {
		...subject,
		_tag: "ReplaySubject",
		subscribe: (observer) => {
			buffer.forEach((value) => observer.next(value));
			return (subject as Subject<A>).subscribe(observer);
		},
		next: (value) => {
			buffer.push(value);
			if (buffer.length > bufferSize) {
				buffer.shift();
			}
			(subject as Subject<A>).next(value);
		},
	};
};

export const merge = <const Observables extends readonly Observable<any>[]>(
	...observables: Observables
): Observable<Observables[number][number]> => {
	return createObservable((observer) => {
		const unsubscribes = observables.map((obs) =>
			obs.subscribe({
				next: (value) => observer.next(value),
				error: (error) => observer.error(error),
				complete: () => {},
			})
		);
		return () => unsubscribes.forEach((unsub) => unsub());
	});
};
