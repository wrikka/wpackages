import {
	createBehaviorSubject,
	createObservable,
	createReplaySubject,
	createSubject,
	debounceTime,
	filter,
	fromPromise,
	map,
	merge,
	take,
	tap,
} from "@wpackages/effect/observable";

// From promise
const fromPromiseExample = () => {
	const observable = fromPromise(Promise.resolve(42));

	observable.subscribe({
		next: (value) => console.log("Received:", value),
		error: (error) => console.error("Error:", error),
		complete: () => console.log("Completed"),
	});
};

// Custom observable
const customObservableExample = () => {
	const observable = createObservable((observer) => {
		let count = 0;
		const interval = setInterval(() => {
			observer.next(count++);
			if (count >= 10) {
				observer.complete();
				clearInterval(interval);
			}
		}, 100);

		return () => {
			clearInterval(interval);
			console.log("Cleaned up");
		};
	});

	observable.subscribe({
		next: (value) => console.log("Received:", value),
		error: (error) => console.error("Error:", error),
		complete: () => console.log("Completed"),
	});
};

// Map
const mapExample = () => {
	const observable = fromPromise(Promise.resolve(1));
	const mapped = map((x) => x * 2)(observable);

	mapped.subscribe({
		next: (value) => console.log("Mapped:", value),
		error: (error) => console.error("Error:", error),
		complete: () => console.log("Completed"),
	});
};

// Filter
const filterExample = () => {
	const observable = createObservable((observer) => {
		[1, 2, 3, 4, 5].forEach((value) => observer.next(value));
		observer.complete();
	});

	const filtered = filter((x) => x % 2 === 0)(observable);

	filtered.subscribe({
		next: (value) => console.log("Filtered:", value),
		error: (error) => console.error("Error:", error),
		complete: () => console.log("Completed"),
	});
};

// Tap
const tapExample = () => {
	const observable = createObservable((observer) => {
		[1, 2, 3].forEach((value) => observer.next(value));
		observer.complete();
	});

	const tapped = tap((x) => console.log("Tapped:", x))(observable);

	tapped.subscribe({
		next: (value) => console.log("Received:", value),
		error: (error) => console.error("Error:", error),
		complete: () => console.log("Completed"),
	});
};

// Take
const takeExample = () => {
	const observable = createObservable((observer) => {
		let count = 0;
		const interval = setInterval(() => {
			observer.next(count++);
		}, 100);
		return () => clearInterval(interval);
	});

	const firstFive = take(5)(observable);

	firstFive.subscribe({
		next: (value) => console.log("Taken:", value),
		error: (error) => console.error("Error:", error),
		complete: () => console.log("Completed"),
	});
};

// Subject
const subjectExample = () => {
	const subject = createSubject<number>();

	const subscription1 = subject.subscribe({
		next: (value) => console.log("Observer 1:", value),
	});

	const subscription2 = subject.subscribe({
		next: (value) => console.log("Observer 2:", value),
	});

	subject.next(1);
	subject.next(2);
	subject.next(3);
};

// BehaviorSubject
const behaviorSubjectExample = () => {
	const subject = createBehaviorSubject(0);

	subject.subscribe({
		next: (value) => console.log("Received:", value),
	});

	console.log("Current:", subject.getValue()); // 0

	subject.next(1);
	console.log("Current:", subject.getValue()); // 1

	subject.next(2);
	console.log("Current:", subject.getValue()); // 2
};

// ReplaySubject
const replaySubjectExample = () => {
	const subject = createReplaySubject(3);

	subject.next(1);
	subject.next(2);
	subject.next(3);

	// Late subscriber receives past values
	subject.subscribe({
		next: (value) => console.log("Received:", value),
	});
};

// Merge
const mergeExample = () => {
	const obs1 = fromPromise(Promise.resolve(1));
	const obs2 = fromPromise(Promise.resolve(2));
	const obs3 = fromPromise(Promise.resolve(3));

	const merged = merge(obs1, obs2, obs3);

	merged.subscribe({
		next: (value) => console.log("Merged:", value),
		error: (error) => console.error("Error:", error),
		complete: () => console.log("Completed"),
	});
};

// Run all examples
const main = () => {
	console.log("=== Observable Examples ===\n");

	console.log("\n--- From Promise ---");
	fromPromiseExample();

	console.log("\n--- Custom Observable ---");
	customObservableExample();

	console.log("\n--- Map ---");
	mapExample();

	console.log("\n--- Filter ---");
	filterExample();

	console.log("\n--- Tap ---");
	tapExample();

	console.log("\n--- Take ---");
	takeExample();

	console.log("\n--- Subject ---");
	subjectExample();

	console.log("\n--- BehaviorSubject ---");
	behaviorSubjectExample();

	console.log("\n--- ReplaySubject ---");
	replaySubjectExample();

	console.log("\n--- Merge ---");
	mergeExample();
};

main();
