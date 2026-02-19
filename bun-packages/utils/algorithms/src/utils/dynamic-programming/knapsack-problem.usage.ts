import { knapsack } from './knapsack-problem';

const items = [
  { weight: 10, value: 60 },
  { weight: 20, value: 100 },
  { weight: 30, value: 120 },
];
const capacity = 50;

const result = knapsack(items, capacity);

console.log('Max value:', result.maxValue);
console.log('Selected items:', result.selectedItems);
