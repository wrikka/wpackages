import { Queue } from "./queue";

const queue = new Queue<string>();

queue.enqueue("first");
queue.enqueue("second");
queue.enqueue("third");

console.log("Queue size:", queue.size());
console.log("Front element:", queue.front());
console.log("Dequeue:", queue.dequeue());
console.log("Dequeue:", queue.dequeue());
console.log("Is empty:", queue.isEmpty());
