import { editDistance } from "./edit-distance";

const str1 = "kitten";
const str2 = "sitting";

const distance = editDistance(str1, str2);

console.log("String 1:", str1);
console.log("String 2:", str2);
console.log("Edit distance:", distance);
