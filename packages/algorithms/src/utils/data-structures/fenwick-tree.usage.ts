import { FenwickTree } from "./fenwick-tree";

const ft = new FenwickTree(10);

ft.update(1, 5);
ft.update(3, 2);
ft.update(7, 3);

console.log("Sum from 1 to 5:", ft.query(5));
console.log("Sum from 3 to 7:", ft.rangeQuery(3, 7));
