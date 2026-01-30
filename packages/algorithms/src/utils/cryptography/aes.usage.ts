import { aesDecrypt, aesEncrypt } from "./aes";

const key = new Uint8Array(32).fill(1);
const iv = new Uint8Array(12).fill(2);
const plaintext = "Hello, World!";

const { ciphertext, iv: returnedIv } = await aesEncrypt(plaintext, key, iv);
console.log("Encrypted:", ciphertext);

const decrypted = await aesDecrypt(ciphertext, key, returnedIv);
console.log("Decrypted:", new TextDecoder().decode(decrypted));
