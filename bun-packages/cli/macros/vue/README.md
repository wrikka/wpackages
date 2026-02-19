# @wpackages/macros-vue

A collection of useful Vue macros for build-time code generation.

## Features

- `defineProps` - Type-safe props definition with automatic inference
- `defineEmits` - Type-safe emits definition with automatic inference
- `defineModel` - Simplified v-model binding with type safety
- `defineSlots` - Type-safe slots definition
- `defineExpose` - Expose methods to parent component
- `defineOptions` - Component options configuration
- `defineModels` - Multiple v-model bindings
- `useStore` - Pinia store integration with type safety

## Installation

```bash
bun add @wpackages/macros-vue
```

## Usage

### defineProps

Type-safe props definition with automatic type inference.

```typescript
import { defineProps } from "@wpackages/macros-vue";

const props = defineProps<{
  name: string;
  age: number;
  active?: boolean;
}>();
```

### defineEmits

Type-safe emits definition with automatic type inference.

```typescript
import { defineEmits } from "@wpackages/macros-vue";

const emit = defineEmits<{
  update: [value: string];
  delete: [id: number];
}>();

emit("update", "new value");
emit("delete", 123);
```

### defineModel

Simplified v-model binding with type safety.

```typescript
import { defineModel } from "@wpackages/macros-vue";

const model = defineModel<string>();
const count = defineModel<number>("count", { default: 0 });
```

### useStore

Pinia store integration with type safety.

```typescript
import { useStore } from "@wpackages/macros-vue";

const store = useStore("user");
const user = store.getState();
```

### defineSlots

Type-safe slots definition.

```typescript
import { defineSlots } from "@wpackages/macros-vue";

const slots = defineSlots<{
  default: (props: { message: string }) => void;
  header: () => void;
  footer: () => void;
}>();
```

### defineExpose

Expose methods to parent component.

```typescript
import { defineExpose } from "@wpackages/macros-vue";

defineExpose({
  validate: () => true,
  reset: () => {},
  submit: () => {},
});
```

### defineOptions

Component options configuration.

```typescript
import { defineOptions } from "@wpackages/macros-vue";

defineOptions({
  name: "MyComponent",
  inheritAttrs: false,
  customOptions: true,
});
```

### defineModels

Multiple v-model bindings.

```typescript
import { defineModels } from "@wpackages/macros-vue";

const models = defineModels<{
  value: string;
  count: number;
  active: boolean;
}>();

console.log(models.value);
console.log(models.count);
console.log(models.active);
```

## Development

```bash
bun install
bun run dev
bun run test
bun run lint
bun run build
```

## License

MIT
