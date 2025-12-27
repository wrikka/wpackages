<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  data: { type: [Object, Array, String, Number, Boolean, null], required: true },
  level: { type: Number, default: 0 },
  root: { type: Boolean, default: false },
});

const isOpen = ref(props.root || props.level < 1);

const isObject = computed(() => typeof props.data === 'object' && props.data !== null && !Array.isArray(props.data));
const isArray = computed(() => Array.isArray(props.data));
const isPrimitive = computed(() => !isObject.value && !isArray.value);

const label = computed(() => {
  if (isArray.value) {
    return `Array(${(props.data as unknown[]).length})`;
  }
  if (isObject.value) {
    return 'Object';
  }
  return '';
});

const valueType = computed(() => {
  if (props.data === null) return 'null';
  if (isObject.value) return 'object';
  if (isArray.value) return 'array';
  return typeof props.data;
});

function toggle() {
  isOpen.value = !isOpen.value;
}
</script>

<template>
  <div class="font-mono text-sm">
    <div v-if="isObject || isArray" @click.stop="toggle" class="cursor-pointer inline-flex items-center">
      <span class="transition-transform" :class="{ 'rotate-90': isOpen }">▶</span>
      <span class="ml-1">{{ label }}</span>
    </div>

    <div v-if="isOpen && (isObject || isArray)" class="pl-5 border-l border-gray-700">
      <div v-for="(value, key) in data" :key="key" class="flex">
        <span class="text-purple-400 mr-2">{{ key }}:</span>
        <JsonTreeView :data="value" :level="level + 1" />
      </div>
    </div>

    <div v-if="isPrimitive">
      <span :class="{
        'text-green-400': valueType === 'string',
        'text-yellow-400': valueType === 'number',
        'text-blue-400': valueType === 'boolean',
        'text-gray-500': valueType === 'null',
      }">{{ JSON.stringify(data) }}</span>
    </div>
  </div>
</template>
