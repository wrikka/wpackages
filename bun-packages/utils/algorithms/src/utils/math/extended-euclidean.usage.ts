import { extendedEuclidean } from "./extended-euclidean";

const result = extendedEuclidean(35, 15);

console.log("GCD of 35 and 15:", result.gcd);
console.log("Coefficients (x, y):", result.x, result.y);
console.log("Verification:", result.x + "* 35 +", result.y, "* 15 =", result.x * 35 + result.y * 15);
