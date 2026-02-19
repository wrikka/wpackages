import { Stack } from "./stack";

const stack = new Stack<number>();

stack.push(1);
stack.push(2);
stack.push(3);

console.log("Stack size:", stack.size());
console.log("Top element:", stack.peek());
console.log("Pop:", stack.pop());
console.log("Pop:", stack.pop());
console.log("Is empty:", stack.isEmpty());
