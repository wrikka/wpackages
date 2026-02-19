import { debounce } from "./debounce";

const debouncedLog = debounce((message: string) => {
	console.log("Logged:", message);
}, 300);

debouncedLog("Hello");
debouncedLog("World");
debouncedLog("!");

setTimeout(() => {
	console.log("After 500ms, only '!' should be logged");
}, 500);
