import { createSelector } from '../core/conditionalSelector';
import { chainSelectors } from './chainSelectors';

// --------------------------
// Example 1: Simple data transformation pipeline
// --------------------------
console.log('--- Example 1: Simple data transformation pipeline ---');

type User = { name: string; age: number; roles: string[] };

const user: User = { name: 'Alice', age: 30, roles: ['admin', 'editor'] };

const getName = (u: User): string => u.name;
const toUpperCase = (s: string): string => s.toUpperCase();
const exclaim = (s: string): string => `${s}!`;

const getExcitedUserName = chainSelectors(getName, toUpperCase, exclaim);

console.log(`Original name: ${user.name}`);
console.log(`Transformed name: ${getExcitedUserName(user)}`); // Output: ALICE!

// --------------------------
// Example 2: Chaining with conditional selectors
// --------------------------
console.log('\n--- Example 2: Chaining with conditional selectors ---');

const selectPrimaryRole = createSelector([
    { condition: (u: User) => u.roles.includes('admin'), result: 'Administrator' },
    { condition: (u: User) => u.roles.includes('editor'), result: 'Editor' },
], 'Viewer');

const generateGreeting = (role: string): string => `Your primary role is: ${role}`;

const getUserGreeting = chainSelectors(selectPrimaryRole, generateGreeting);

const user1: User = { name: 'Bob', age: 40, roles: ['editor', 'viewer'] };
const user2: User = { name: 'Charlie', age: 25, roles: ['viewer'] };

console.log(`Greeting for ${user1.name}: ${getUserGreeting(user1)}`); // Output: Administrator (because admin is checked first)
console.log(`Greeting for ${user2.name}: ${getUserGreeting(user2)}`); // Output: Viewer
