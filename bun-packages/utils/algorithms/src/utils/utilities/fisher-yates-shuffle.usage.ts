import { fisherYatesShuffle } from "./fisher-yates-shuffle";

const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
console.log("Original array:", array);

const shuffledArray = fisherYatesShuffle(array);
console.log("Shuffled array:", shuffledArray);
