import { RedBlackTree } from "./red-black-tree";

const rbt = new RedBlackTree<number>();

rbt.insert(10);
rbt.insert(20);
rbt.insert(30);
rbt.insert(5);
rbt.insert(15);

console.log("Search 20:", rbt.search(20));
console.log("Search 100:", rbt.search(100));
