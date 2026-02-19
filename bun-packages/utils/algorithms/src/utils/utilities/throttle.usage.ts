import { throttle } from "./throttle";

const throttledLog = throttle((message: string) => {
	console.log("Logged:", message);
}, 300);

throttledLog("Call 1");
throttledLog("Call 2");
throttledLog("Call 3");

setTimeout(() => {
	throttledLog("Call 4");
}, 400);
