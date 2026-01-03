import { createClient } from '../src';
import { api, ApiType } from './app';

const client = createClient<ApiType>('http://localhost:3000', api);

async function main() {
  try {
    console.log('Calling getUser...');
    const user = await client.getUser(undefined); // Pass undefined for body as it's not required
    console.log('Received user:', user);

    // This would cause a type error if you tried to access a non-existent property:
    // console.log(user.age);

  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
