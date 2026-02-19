import { DisjointSetUnion } from "./disjoint-set-union";

const dsu = new DisjointSetUnion(5);

dsu.union(0, 1);
dsu.union(1, 2);
dsu.union(3, 4);

console.log("Are 0 and 2 connected?", dsu.connected(0, 2));
console.log("Are 0 and 3 connected?", dsu.connected(0, 3));
console.log("Are 3 and 4 connected?", dsu.connected(3, 4));
