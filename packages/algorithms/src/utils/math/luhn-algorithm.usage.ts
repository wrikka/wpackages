import { luhnCheck } from "./luhn-algorithm";

const validCardNumber = "79927398713";
const invalidCardNumber = "79927398714";

console.log(`Is ${validCardNumber} valid?`, luhnCheck(validCardNumber)); // Output: true
console.log(`Is ${invalidCardNumber} valid?`, luhnCheck(invalidCardNumber)); // Output: false
