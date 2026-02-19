import { levenshteinDistance } from "./levenshtein-distance";

const str1 = "kitten";
const str2 = "sitting";

const distance = levenshteinDistance(str1, str2);

console.log(`The Levenshtein distance between '${str1}' and '${str2}' is ${distance}.`);
