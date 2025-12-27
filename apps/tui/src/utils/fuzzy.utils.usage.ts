import { fuzzyFilter, fuzzyMatch } from "./fuzzy.utils";

// Example 1: Simple fuzzy match
console.log("Fuzzy Match Examples:");
console.log(fuzzyMatch("test", "test")); // 1000 (exact match)
console.log(fuzzyMatch("te", "test")); // 500 (starts with)
console.log(fuzzyMatch("es", "test")); // 250 (contains)
console.log(fuzzyMatch("tt", "test")); // >0 (fuzzy match)

// Example 2: Filter array of strings
const names = ["Alice", "Bob", "Charlie", "David", "Eve"] as const;
const query = "a";

console.log("\nFiltered Names:");
const filtered = fuzzyFilter(query, names, (name) => name);
console.log(filtered); // ["Alice", "Charlie", "David"]

// Example 3: Filter objects
const frameworks = [
	{ name: "React", type: "library" },
	{ name: "Vue", type: "framework" },
	{ name: "Angular", type: "framework" },
	{ name: "Svelte", type: "compiler" },
] as const;

console.log("\nFiltered Frameworks:");
const filteredFrameworks = fuzzyFilter("react", frameworks, (f) => f.name, 3);
console.log(filteredFrameworks);

// Example 4: Real-world search
const commands = [
	{ name: "git commit", description: "Commit changes" },
	{ name: "git push", description: "Push to remote" },
	{ name: "git pull", description: "Pull from remote" },
	{ name: "npm install", description: "Install dependencies" },
] as const;

console.log("\nCommand Search:");
const searchResults = fuzzyFilter("git", commands, (cmd) => cmd.name);
console.log(searchResults.map((cmd) => cmd.name));
