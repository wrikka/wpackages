import { debounce } from "./debounce";

// Search input
const search = debounce((query: string) => {
	console.log("Searching for:", query);
}, 300);

search("a");
search("ab");
search("abc"); // Only this will execute after 300ms

// Window resize
debounce(() => {
	console.log("Window resized");
}, 500);

// Multiple arguments
const log = debounce((a: number, b: string) => {
	console.log(a, b);
}, 200);

log(1, "first");
log(2, "second"); // Only this executes
