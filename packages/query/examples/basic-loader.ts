import { Query } from "../src";

interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    id,
    name: `User ${id}`,
    email: `user${id}@example.com`,
  };
}

async function main() {
  console.log("=== Basic Query Example ===\n");

  // Create a query
  const query = new Query<User>(
    "user-1",
    () => fetchUser(1),
    {
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      retryDelay: (attempt) => attempt * 1000,
    },
  );

  // Subscribe to state changes
  const unsubscribe = query.subscribe((state) => {
    console.log(`State: ${state.status}`);
    console.log(`Loading: ${state.isLoading}`);
    console.log(`Fetching: ${state.isFetching}`);
    console.log(`Data:`, state.data);
    console.log(`Error:`, state.error);
    console.log("---");
  });

  // Fetch data
  console.log("Fetching user...");
  const user = await query.fetch();
  console.log("Fetched user:", user);

  // Get current state
  const currentState = query.current;
  console.log("Current state:", currentState);

  // Invalidate and refetch
  console.log("\nInvalidating and refetching...");
  query.invalidate();

  // Wait a bit
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Cleanup
  unsubscribe();
  query.destroy();

  console.log("\nDone!");
}

main().catch(console.error);
