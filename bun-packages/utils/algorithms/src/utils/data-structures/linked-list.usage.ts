import { LinkedList } from "./linked-list";

const list = new LinkedList<number>();

list.append(1);
list.append(2);
list.append(3);
list.prepend(0);

console.log("List:", list.toArray());
console.log("Size:", list.size());
console.log("Find 2:", list.find(2));

list.delete(2);
console.log("After deleting 2:", list.toArray());
