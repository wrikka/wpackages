export interface Observable<out A> {
	readonly _tag: "Observable";
	subscribe(observer: Observer<A>): Unsubscribe;
}

export interface Observer<in A> {
	next(value: A): void;
	error(error: unknown): void;
	complete(): void;
}

export type Unsubscribe = () => void;

export interface Subject<in out A> extends Observable<A>, Observer<A> {
	readonly _tag: "Subject";
	next(value: A): void;
	error(error: unknown): void;
	complete(): void;
}

export interface BehaviorSubject<in out A> extends Subject<A> {
	readonly _tag: "BehaviorSubject";
	getValue(): A;
}

export interface ReplaySubject<in out A> extends Subject<A> {
	readonly _tag: "ReplaySubject";
}
