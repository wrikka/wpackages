import { defineProps, defineEmits, defineModel } from "../src/index";

const props = defineProps<{
  name: string;
  age: number;
  active?: boolean;
}>();

const emit = defineEmits<{
  update: [value: string];
  delete: [id: number];
}>();

const model = defineModel<string>();
const count = defineModel<number>("count", { default: 0 });

console.log(props.name, props.age);
emit("update", "new value");
emit("delete", 123);
console.log(model);
console.log(count);
