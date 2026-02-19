import { Trie } from "./trie";

const trie = new Trie();

trie.insert("apple");
trie.insert("app");
trie.insert("application");

console.log("Search 'apple':", trie.search("apple"));
console.log("Search 'app':", trie.search("app"));
console.log("Search 'appl':", trie.search("appl"));
console.log("StartsWith 'app':", trie.startsWith("app"));
console.log("StartsWith 'ban':", trie.startsWith("ban"));
