import { matrixChainMultiplication } from "./matrix-chain-multiplication";

const dimensions = [10, 30, 5, 60];

const minCost = matrixChainMultiplication(dimensions);

console.log("Matrix dimensions:", dimensions);
console.log("Minimum multiplication cost:", minCost);
