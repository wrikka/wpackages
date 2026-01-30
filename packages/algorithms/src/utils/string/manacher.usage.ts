import { manacher } from "./manacher";

const str = "babad";
const palindromes = manacher(str);

console.log("String:", str);
console.log("Longest palindromic substring:", palindromes);
