import { simpleHash, djb2Hash, sdbmHash, fnv1aHash, murmurHash3 } from "./hash";

const text = "Hello World!";
console.log("Text:", text);
console.log("Simple Hash:", simpleHash(text));
console.log("DJB2 Hash:", djb2Hash(text));
console.log("SDBM Hash:", sdbmHash(text));
console.log("FNV-1a Hash:", fnv1aHash(text));
console.log("MurmurHash3:", murmurHash3(text));
