import { pbkdf2 } from "./pbkdf2";

const key = await pbkdf2("my-password", "random-salt", 100000, 32);
console.log(key);
