import { hmac } from "./hmac";

const signature = hmac("Hello, World!", "my-secret-key");
console.log(signature);
