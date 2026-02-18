/**
 * wshell examples - demonstrating structured data pipeline
 */
import { 
  $, 
  int, 
  str, 
  list, 
  record, 
  table, 
  toJSON,
  pipelineValue,
  collectToValue,
} from "../src/index";

// Example 1: Basic template literal usage (like Bun shell)
async function example1() {
  console.log("=== Example 1: Template Literal API ===");
  
  // Run shell commands with template literals
  try {
    const result = await $`echo "Hello from wshell!"`.text();
    console.log("Output:", result);
  } catch (error) {
    console.log("Note: Bun shell not available in test environment");
  }
}

// Example 2: Structured data pipeline
async function example2() {
  console.log("\n=== Example 2: Structured Data Pipeline ===");
  
  // Create structured data like Nushell
  const data = table(
    ["name", "age", "city"],
    [
      record({ name: str("Alice"), age: int(25), city: str("NYC") }),
      record({ name: str("Bob"), age: int(30), city: str("LA") }),
      record({ name: str("Charlie"), age: int(35), city: str("Chicago") }),
    ]
  );
  
  console.log("Table data (JSON):");
  console.log(JSON.stringify(toJSON(data), null, 2));
}

// Example 3: Working with lists and filters
async function example3() {
  console.log("\n=== Example 3: List Operations ===");
  
  // Create a list of values
  const numbers = list([int(1), int(2), int(3), int(4), int(5)]);
  console.log("Numbers:", toJSON(numbers));
  
  // Create a list of records
  const users = list([
    record({ name: str("Alice"), age: int(25) }),
    record({ name: str("Bob"), age: int(30) }),
    record({ name: str("Charlie"), age: int(35) }),
  ]);
  console.log("Users:", JSON.stringify(toJSON(users), null, 2));
}

// Example 4: Pipeline data operations
async function example4() {
  console.log("\n=== Example 4: Pipeline Data ===");
  
  // Create pipeline data
  const pipeline = pipelineValue(str("Hello from pipeline"));
  console.log("Pipeline created:", pipeline._tag);
  
  // Collect to value
  const value = await collectToValue(pipeline);
  console.log("Collected value:", toJSON(value));
}

// Example 5: Type system demonstration
async function example5() {
  console.log("\n=== Example 5: Type System ===");
  
  const values = [
    int(42),
    str("hello"),
    bool(true),
    list([int(1), int(2)]),
  ];
  
  for (const v of values) {
    console.log(`Value: ${toJSON(v)}, Type: ${v._tag}`);
  }
}

// Run examples
async function main() {
  try {
    await example1();
    await example2();
    await example3();
    await example4();
    await example5();
    
    console.log("\n=== All examples completed! ===");
  } catch (error) {
    console.error("Example failed:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.main) {
  main();
}
