import { run } from '../src';

// A function that simulates a failing API call
let attempt = 0;
const unreliableApiCall = async (): Promise<{ data: string }> => {
  attempt++;
  console.log(`Attempt #${attempt}: Trying to call the API...`);
  if (attempt < 3) {
    throw new Error('API is not available');
  }
  console.log('API call successful!');
  return { data: 'some data' };
};

const main = async () => {
  console.log('--- Running with retry ---');
  const result = await run(unreliableApiCall, {
    retryAttempts: 3,
  });

  if (result.success) {
    console.log('Operation succeeded:', result.data);
  } else {
    console.error('Operation failed:', result.error?.message);
  }
  console.log('Result metadata:', result.metadata);
};

main();
