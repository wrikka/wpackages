import { Trie } from '../core/trie';

const trie = new Trie();

console.log('Inserting words: apple, app, apricot, banana');
trie.insert('apple');
trie.insert('app');
trie.insert('apricot');
trie.insert('banana');

console.log("\nSearching for words:");
console.log(`Search 'apple':`, trie.search('apple')); // true
console.log(`Search 'appl':`, trie.search('appl'));   // false
console.log(`Search 'orange':`, trie.search('orange')); // false

console.log("\nChecking for prefixes:");
console.log(`Starts with 'ap':`, trie.startsWith('ap'));     // true
console.log(`Starts with 'ban':`, trie.startsWith('ban'));   // true
console.log(`Starts with 'or':`, trie.startsWith('or'));     // false
