import { BloomFilter } from "./bloom-filter";

// Usage example for BloomFilter
const filter = new BloomFilter(100, 4);

filter.add("apple");
filter.add("banana");

console.log("Contains 'apple'?", filter.has("apple")); // Expected: true
console.log("Contains 'cherry'?", filter.has("cherry")); // Expected: false (or possibly true, with a small probability)
console.log("Contains 'grape'?", filter.has("grape")); // Expected: false
