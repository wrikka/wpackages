import { sieveOfEratosthenes } from "./sieve-of-eratosthenes";

const limit = 30;
const primes = sieveOfEratosthenes(limit);

console.log(`Prime numbers up to ${limit}:`, primes);
// Output: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
