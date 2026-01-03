import { createSelector } from '../core/conditionalSelector';
import { withDebugging } from './withDebugging';

// --------------------------
// Example 1: Debugging a simple selector
// --------------------------
console.log('--- Example 1: Debugging a simple selector ---');

const classifyNumber = createSelector([
  { condition: (n: number) => n > 0, result: 'Positive' },
  { condition: (n: number) => n < 0, result: 'Negative' },
], 'Zero');

const debuggedClassifyNumber = withDebugging(classifyNumber, 'NumberClassifier');

debuggedClassifyNumber(10);
debuggedClassifyNumber(-5);
debuggedClassifyNumber(0);

// --------------------------
// Example 2: Using a custom logger
// --------------------------
console.log('\n--- Example 2: Using a custom logger ---');

type User = { name: string, role: 'admin' | 'user' };
const getUserRole = (user: User) => user.role;

const customLogs: string[] = [];
const customLogger = (message: string) => {
    customLogs.push(`[CUSTOM LOG - ${new Date().toISOString()}] ${message}`);
};

const debuggedGetUserRole = withDebugging(getUserRole, 'RoleSelector', customLogger);

debuggedGetUserRole({ name: 'Alice', role: 'admin' });

console.log('Custom logs collected:');
customLogs.forEach(log => console.log(log));
