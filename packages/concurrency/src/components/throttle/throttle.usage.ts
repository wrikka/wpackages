import { throttle } from "./throttle";

// Scroll handler
const handleScroll = throttle(() => {
	console.log("Scrolling...");
}, 100);

// Will execute at most once per 100ms
window.addEventListener("scroll", handleScroll);

// API calls
const saveData = throttle((data: Record<string, unknown>) => {
	console.log("Saving:", data);
}, 1000);

saveData({ id: 1 });
saveData({ id: 2 }); // Ignored
saveData({ id: 3 }); // Ignored
// Only first call executes immediately

// Button clicks
throttle(() => {
	console.log("Button clicked");
}, 500);
