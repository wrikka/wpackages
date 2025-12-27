import { chunkArray } from './utils/array';
import { capitalizeString } from './utils/string';
import type { User, Status } from './types';

const users: User[] = [
  { id: 1, name: 'alice', email: 'alice@example.com' },
  { id: 2, name: 'bob', email: 'bob@example.com' },
  { id: 3, name: 'charlie', email: 'charlie@example.com' },
];

const status: Status = 'active';

console.log(`Current status: ${capitalizeString(status)}`);

const chunkedUsers = chunkArray(users, 2);
console.log('Chunked users:', chunkedUsers);
