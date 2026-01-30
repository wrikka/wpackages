import { coinChange } from "./coin-change";

const coins = [1, 2, 5];
const amount = 11;

const minCoins = coinChange(coins, amount);

console.log("Coins:", coins);
console.log("Amount:", amount);
console.log("Minimum number of coins:", minCoins);
