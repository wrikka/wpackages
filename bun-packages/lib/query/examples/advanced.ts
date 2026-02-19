import { Query, Mutation } from "../src";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// Simulated API
let todos: Todo[] = [
  { id: 1, title: "Learn TypeScript", completed: false },
  { id: 2, title: "Build a project", completed: false },
];

async function fetchTodos(): Promise<Todo[]> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return [...todos];
}

async function addTodo(title: string): Promise<Todo> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newTodo = {
    id: todos.length + 1,
    title,
    completed: false,
  };
  todos.push(newTodo);
  return newTodo;
}

async function toggleTodo(id: number): Promise<Todo> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
  }
  return todo!;
}

async function main() {
  console.log("=== Advanced Example: Todo App ===\n");

  // Create query for todos
  const todosQuery = new Query<Todo[]>(
    "todos",
    fetchTodos,
    {
      staleTime: 10 * 1000,
      cacheTime: 60 * 1000,
      refetchOnWindowFocus: true,
      onSuccess: (data) => console.log(`Loaded ${data.length} todos`),
    },
  );

  // Create mutation for adding todos
  const addTodoMutation = new Mutation<Todo, string>(
    addTodo,
    {
      onSuccess: (data) => {
        console.log("Added todo:", data.title);
        // Invalidate todos query to refetch
        todosQuery.invalidate();
      },
    },
  );

  // Create mutation for toggling todos
  const toggleTodoMutation = new Mutation<Todo, number>(
    toggleTodo,
    {
      onSuccess: (data) => {
        console.log(`Toggled todo: ${data.title} (${data.completed})`);
        // Optimistically update the query
        todosQuery.mutate(async (current) => {
          if (!current) return current;
          return current.map((t) => (t.id === data.id ? data : t));
        });
      },
    },
  );

  // Fetch todos
  console.log("Fetching todos...");
  await todosQuery.fetch();

  // Add a new todo
  console.log("\nAdding new todo...");
  await addTodoMutation.mutate("Write documentation");

  // Toggle a todo
  console.log("\nToggling todo...");
  await toggleTodoMutation.mutate(1);

  // Get current state
  console.log("\nCurrent todos:");
  console.log(todosQuery.current.data);

  // Manual update
  console.log("\nManually updating todos...");
  todosQuery.setData([
    { id: 1, title: "Learn TypeScript", completed: true },
    { id: 2, title: "Build a project", completed: true },
    { id: 3, title: "Write documentation", completed: false },
  ]);

  console.log("Updated todos:");
  console.log(todosQuery.current.data);

  // Cleanup
  todosQuery.destroy();

  console.log("\nDone!");
}

main().catch(console.error);
