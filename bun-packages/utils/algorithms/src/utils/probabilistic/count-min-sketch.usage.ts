import { CountMinSketch } from "./count-min-sketch";

const cms = new CountMinSketch(1000, 5);

const data = ["apple", "banana", "apple", "orange", "banana", "grape", "apple", "banana"];

data.forEach((item) => cms.add(item));

console.log("Count of 'apple':", cms.count("apple"));
console.log("Count of 'banana':", cms.count("banana"));
console.log("Count of 'orange':", cms.count("orange"));
console.log("Count of 'grape':", cms.count("grape"));
console.log("Count of 'pear':", cms.count("pear"));
