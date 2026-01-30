import { euclideanAlgorithm } from "./euclidean-algorithm";

const a = 48;
const b = 18;

const gcd = euclideanAlgorithm(a, b);

console.log(`The GCD of ${a} and ${b} is ${gcd}.`); // Output: 6
