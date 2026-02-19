import {
	clear,
	createPriorityQueue,
	createQueue,
	dequeue,
	dequeuePriority,
	enqueue,
	enqueuePriority,
	isEmpty,
	isEmptyPriority,
	isFull,
	peek,
	peekPriority,
	size,
	sizePriority,
} from "./queue";

// Example 1: Basic queue operations
function example1() {
	console.log("=== Queue Example 1: Basic Operations ===");

	let queue = createQueue<string>(["first", "second"]);

	console.log("Initial queue size:", size(queue));
	console.log("First item:", peek(queue));

	// Add items
	queue = enqueue(queue, "third");
	queue = enqueue(queue, "fourth");

	console.log("After adding items, size:", size(queue));
	console.log("First item:", peek(queue));

	// Remove items
	let result = dequeue(queue);
	queue = result.queue;
	console.log("Dequeued item:", result.item);
	console.log("Remaining size:", size(queue));

	result = dequeue(queue);
	queue = result.queue;
	console.log("Dequeued item:", result.item);
	console.log("Remaining size:", size(queue));
}

// Example 2: Queue with capacity limits
function example2() {
	console.log("\n=== Queue Example 2: Capacity Limits ===");

	let queue = createQueue<number>([], 3);

	console.log("Empty queue is full:", isFull(queue));

	// Fill the queue
	queue = enqueue(queue, 1);
	queue = enqueue(queue, 2);
	queue = enqueue(queue, 3);

	console.log("Full queue size:", size(queue));
	console.log("Queue is full:", isFull(queue));

	// Try to add one more (should throw)
	try {
		queue = enqueue(queue, 4);
	} catch (error) {
		console.log("Error when exceeding capacity:", error instanceof Error ? error.message : String(error));
	}

	// Clear and check
	queue = clear(queue);
	console.log("After clear, size:", size(queue));
	console.log("Is empty:", isEmpty(queue));
}

// Example 3: Priority queue operations
function example3() {
	console.log("\n=== Queue Example 3: Priority Queue ===");

	let pq = createPriorityQueue<string>();

	// Add items with different priorities
	pq = enqueuePriority(pq, "Low priority task", 3);
	pq = enqueuePriority(pq, "High priority task", 1);
	pq = enqueuePriority(pq, "Medium priority task", 2);
	pq = enqueuePriority(pq, "Urgent task", 0);

	console.log("Priority queue size:", sizePriority(pq));
	const highestPriority = peekPriority(pq);
	console.log("Highest priority item:", highestPriority);

	// Dequeue items (should come out in priority order)
	let result = dequeuePriority(pq);
	pq = result.queue;
	console.log("Dequeued:", result.item);

	result = dequeuePriority(pq);
	pq = result.queue;
	console.log("Dequeued:", result.item);

	result = dequeuePriority(pq);
	pq = result.queue;
	console.log("Dequeued:", result.item);

	result = dequeuePriority(pq);
	pq = result.queue;
	console.log("Dequeued:", result.item);

	console.log("Priority queue is empty:", isEmptyPriority(pq));
}

// Example 4: Task processing with priority queue
function example4() {
	console.log("\n=== Queue Example 4: Task Processing ===");

	type Task = {
		id: number;
		name: string;
		priority: number;
	};

	let taskQueue = createPriorityQueue<Task>();

	// Add various tasks
	const tasks: Task[] = [
		{ id: 1, name: "Send emails", priority: 2 },
		{ id: 2, name: "Fix critical bug", priority: 0 },
		{ id: 3, name: "Update documentation", priority: 3 },
		{ id: 4, name: "Review pull request", priority: 1 },
		{ id: 5, name: "Weekly report", priority: 2 },
	];

	// Enqueue all tasks
	for (const task of tasks) {
		taskQueue = enqueuePriority(taskQueue, task, task.priority);
	}

	console.log(`Enqueued ${sizePriority(taskQueue)} tasks`);

	// Process tasks in priority order
	let processed = 0;
	while (!isEmptyPriority(taskQueue)) {
		const result = dequeuePriority(taskQueue);
		taskQueue = result.queue;

		if (result.item) {
			processed++;
			console.log(`Processing task ${processed}: ${result.item.name} (priority ${result.item.priority})`);
		}
	}

	console.log(`Processed ${processed} tasks`);
}

// Run all examples
function runExamples() {
	example1();
	example2();
	example3();
	example4();
}

runExamples();
