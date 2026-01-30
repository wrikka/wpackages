import { AVLTree } from "./avl-tree";

const avl = new AVLTree<number>();

avl.insert(10);
avl.insert(20);
avl.insert(30);
avl.insert(40);
avl.insert(50);
avl.insert(25);

console.log("Search 20:", avl.search(20));
console.log("Search 100:", avl.search(100));
