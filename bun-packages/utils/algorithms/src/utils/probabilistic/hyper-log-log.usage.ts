import { HyperLogLog } from "./hyper-log-log";

const hll = new HyperLogLog();

const data = ["apple", "banana", "apple", "orange", "banana", "grape", "apple"];

data.forEach((item) => hll.add(item));

console.log("Estimated unique count:", hll.count());
console.log("Actual unique count:", new Set(data).size);
