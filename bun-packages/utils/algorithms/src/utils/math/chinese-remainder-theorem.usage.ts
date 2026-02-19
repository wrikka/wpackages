import { chineseRemainderTheorem } from "./chinese-remainder-theorem";

const a = [2, 3, 2];
const m = [3, 5, 7];

const result = chineseRemainderTheorem(a, m);

console.log("Remainders:", a);
console.log("Moduli:", m);
console.log("Solution:", result);
console.log("Verification:");
a.forEach((ai, i) => console.log(`${result} mod ${m[i]} = ${result % m[i]} (expected ${ai})`));
