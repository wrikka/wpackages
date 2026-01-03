import { createAsyncSelector } from './asyncConditionalSelector';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API call
const checkUserPermissions = async (userId: number): Promise<'admin' | 'user'> => {
  await delay(50);
  return userId === 1 ? 'admin' : 'user';
};

const fetchUserData = async (userId: number): Promise<{ name: string }> => {
    await delay(100);
    return { name: userId === 1 ? 'Alice' : 'Bob' };
}


async function runAsyncSelectorExample() {
  console.log('--- Async Selector Example: User Data Fetching ---');

  const getUserDashboard = createAsyncSelector([
    {
      condition: async (id: number) => (await checkUserPermissions(id)) === 'admin',
      result: async (id: number) => {
        const user = await fetchUserData(id);
        return `Welcome to the Admin Dashboard, ${user.name}!`;
      }
    },
    {
        condition: async (id: number) => (await checkUserPermissions(id)) === 'user',
        result: async (id: number) => {
            const user = await fetchUserData(id);
            return `Hello, ${user.name}. Welcome to your user page.`;
        }
    }
  ], 'Unknown user. Access denied.');

  const adminMessage = await getUserDashboard(1);
  console.log('User ID 1:', adminMessage);

  const userMessage = await getUserDashboard(2);
  console.log('User ID 2:', userMessage);

  const unknownUserMessage = await getUserDashboard(99);
  console.log('User ID 99:', unknownUserMessage);
}

runAsyncSelectorExample().catch(error => {
  console.error('An error occurred in the async selector example:', error);
});
