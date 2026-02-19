import { randomBoolean, randomChoice, randomFloat, randomInt, randomString, randomUUID } from "./random";

console.log("Random int (1-10):", randomInt(1, 10));
console.log("Random float (1.5-10.5):", randomFloat(1.5, 10.5));
console.log("Random choice from [1,2,3,4,5]:", randomChoice([1, 2, 3, 4, 5]));
console.log("Random string (10 chars):", randomString(10));
console.log("Random boolean:", randomBoolean());
console.log("Random UUID:", randomUUID());
