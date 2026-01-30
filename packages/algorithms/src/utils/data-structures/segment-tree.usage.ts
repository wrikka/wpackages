import { SegmentTree } from "./segment-tree";

const data = [1, 3, 5, 7, 9, 11];
const st = new SegmentTree(data);

console.log("Sum from 1 to 4:", st.query(1, 4));

st.update(2, 10);
console.log("After updating index 2 to 10:");
console.log("Sum from 1 to 4:", st.query(1, 4));
