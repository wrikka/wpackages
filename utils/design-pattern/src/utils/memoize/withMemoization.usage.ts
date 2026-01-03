import { createSelector } from '../core/conditionalSelector';
import { withMemoization } from './withMemoization';

// --------------------------
// Example: Memoizing an expensive calculation
// --------------------------
console.log('--- Example: Memoizing an expensive calculation ---');

// A "slow" function that we want to avoid calling unnecessarily
const expensiveCalculation = (n: number): string => {
  console.log(`Performing expensive calculation for ${n}...`);
  // Simulate a delay
  const start = Date.now();
  while (Date.now() - start < 50) {}
  return `Result for ${n} is ${n * n}`;
};

const getCalculationResult = createSelector([
    { condition: (n: number) => n > 0, result: expensiveCalculation },
], 'Input must be positive');


const memoizedGetResult = withMemoization(getCalculationResult);

console.log('First call for 5:');
console.log(memoizedGetResult(5)); // Will be slow and log "Performing..."

console.log('\nSecond call for 5:');
console.log(memoizedGetResult(5)); // Will be instant, no "Performing..." log

console.log('\nFirst call for 10:');
console.log(memoizedGetResult(10)); // Will be slow and log "Performing..."

console.log('\nSecond call for 10:');
console.log(memoizedGetResult(10)); // Will be instant, no "Performing..." log

// --------------------------
// Example 2: Using a cache key resolver for objects
// --------------------------
console.log('\n--- Example 2: Using a cache key resolver ---');

type Config = { id: string; value: number };
let callCount = 0;

const processConfig = (config: Config) => {
    callCount++;
    console.log(`Processing config with id: ${config.id}`);
    return `Processed value: ${config.value * 10}`;
}

const memoizedProcessConfig = withMemoization(processConfig, (config) => config.id);

const config1a = { id: 'A', value: 1 };
const config1b = { id: 'A', value: 1 }; // Same data, different object reference
const config2 = { id: 'B', value: 2 };

console.log(memoizedProcessConfig(config1a));
console.log(`Call count: ${callCount}`); // 1

console.log(memoizedProcessConfig(config1b)); // Should be cached
console.log(`Call count: ${callCount}`); // Still 1

console.log(memoizedProcessConfig(config2));
console.log(`Call count: ${callCount}`); // 2
