import { longestCommonSubsequence } from "./longest-common-subsequence";

const string1 = "AGGTAB";
const string2 = "GXTXAYB";

const lcs = longestCommonSubsequence(string1, string2);

console.log(`The Longest Common Subsequence is: ${lcs}`); // Output: GTAB
